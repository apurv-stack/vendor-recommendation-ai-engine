import asyncio
import logging
from app.graphs.graph_state import AgentState
from app.ai.ai_service import AIService
from app.ai.llm_factory import LLMFactory
from app.ai.prompt_loader import PromptLoader

logger = logging.getLogger(__name__)

class ResponseAgent:

    @staticmethod
    async def execute(state: AgentState) -> AgentState:

        try:

            ai_service = AIService()

            vendors = state.get("ranked_vendors", [])
            filters = state.get("filters", {})
            user_message = state.get("query", "")
            intent = state.get("intent", "")

            logger.debug(
                f"[ResponseAgent] intent={intent} | "
                f"vendors={len(vendors)} | "
                f"session_context={bool(state.get('session_context'))}"
            )

            # -----------------------------------
            # SESSION RESPONSE
            # -----------------------------------

            if intent == "session_query":

                session_context = state.get("session_context", {})

                logger.debug(f"[ResponseAgent] raw session_context received: {session_context}")

                context_payload = None

                if isinstance(session_context, dict):
                    context_payload = (
                        session_context.get("context")
                        or session_context.get("summary")
                        or session_context.get("messages")
                        or session_context.get("history")
                        or session_context.get("data")
                    )

                if not context_payload:
                    logger.warning("[ResponseAgent] session_context is empty or unrecognized shape")
                    response = (
                        "I retrieved your session but it appears to be empty — "
                        "no previous context was found for this session."
                    )

                elif isinstance(context_payload, str) and context_payload.strip():

                    # OPTIMIZATION: Only call LLM if context is long enough
                    # Short context = return directly, no LLM needed
                    if len(context_payload.strip()) < 300:

                        response = (
                            f"Here's a summary of your current session:\n\n"
                            f"{context_payload.strip()}"
                        )

                    else:

                        # Long context — worth summarizing with AI
                        summary_prompt = (
                            f"Summarize this conversation into a concise session summary.\n\n"
                            f"Extract and format as bullet points:\n"
                            f"• Objective\n"
                            f"• Location\n"
                            f"• Budget\n"
                            f"• Guest Count\n"
                            f"• Vendors Discussed\n"
                            f"• Current Status\n\n"
                            f"Conversation:\n{context_payload.strip()}"
                        )

                        ai_result = await ai_service.execute_prompt(summary_prompt)

                        if ai_result.get("success"):
                            response = (
                                f"Here's a summary of your current session:\n\n"
                                f"{ai_result.get('response', '').strip()}"
                            )
                        else:
                            response = (
                                f"Here's the context from your current session:\n\n"
                                f"{context_payload.strip()}"
                            )

                elif isinstance(context_payload, list):

                    if len(context_payload) == 0:
                        response = "Your session history is currently empty."
                    else:
                        formatted = "\n".join(
                            f"- {item}" if isinstance(item, str)
                            else f"- {item.get('role', 'unknown').capitalize()}: "
                                 f"{item.get('content', '')}"
                            for item in context_payload
                        )
                        response = (
                            f"Here's your session history:\n\n{formatted}"
                        )

                elif isinstance(context_payload, dict):

                    formatted = "\n".join(
                        f"• {k.replace('_', ' ').capitalize()}: {v}"
                        for k, v in context_payload.items()
                        if v
                    )
                    response = (
                        f"Here's the context from your current session:\n\n"
                        f"{formatted if formatted else 'No details available.'}"
                    )

                else:
                    response = (
                        f"Here's the context from your current session:\n\n"
                        f"{str(context_payload)}"
                    )

            # -----------------------------------
            # COMPARISON RESPONSE
            # -----------------------------------

            elif intent == "comparison_query" and len(vendors) >= 2:

                v1 = vendors[0]
                v2 = vendors[1]

                def fmt_price(mn, mx):
                    if mn and mx:
                        return f"₹{mn:,} - ₹{mx:,}"
                    return "N/A"

                def fmt_rating(v):
                    rating = getattr(v, "avg_rating", None) or 0
                    reviews = getattr(v, "review_count", None) or 0
                    return f"⭐ {rating} ({reviews} reviews)"

                def fmt_verified(v):
                    return "✅ Verified" if getattr(v, "is_verified", False) else "Not verified"

                def comparison_score(v):
                    rating = getattr(v, "avg_rating", 0) or 0
                    reviews = getattr(v, "review_count", 0) or 0
                    verified_bonus = 10 if getattr(v, "is_verified", False) else 0

                    return (rating * 10) + min(reviews, 500) / 10 + verified_bonus

                comparison_config = state.get("comparison_config", {})
                print(f"RESPONSE AGENT - COMPARISON CONFIG FROM STATE: {comparison_config}")

# Safety net: if state transfer dropped it, load directly from DB
                if not comparison_config:
                    try:
                        from app.services.agent_configuration_service import AgentConfigurationService
                        db = state.get("db")
                        if db:
                            comp_cfg = AgentConfigurationService.get_configuration_by_agent_name(
                                db, "comparison_agent"
                            )
                            comparison_config = comp_cfg.configuration if comp_cfg else {}
                            print(f"RESPONSE AGENT - COMPARISON CONFIG FROM DB: {comparison_config}")
                    except Exception as e:
                        logger.error(f"[ResponseAgent] Failed to load comparison_config from DB: {e}")
                        comparison_config = {}

                show_price    = comparison_config.get("show_price", True)
                show_rating   = comparison_config.get("show_rating", True)
                show_reviews  = comparison_config.get("show_reviews", True)
                show_verified = comparison_config.get("show_verified", True)
                show_city     = comparison_config.get("show_city", True)

                rows = (
                    f"{'Attribute':<20} {getattr(v1, 'name', 'Vendor 1'):<25} {getattr(v2, 'name', 'Vendor 2'):<25}\n"
                    f"{'-'*70}\n"
                )
                if show_price:
                    rows += (
                        f"{'Price':<20} "
                        f"{fmt_price(getattr(v1, 'price_min', None), getattr(v1, 'price_max', None)):<25} "
                        f"{fmt_price(getattr(v2, 'price_min', None), getattr(v2, 'price_max', None)):<25}\n"
                    )
                if show_rating:
                    rows += f"{'Rating':<20} {fmt_rating(v1):<25} {fmt_rating(v2):<25}\n"
                if show_verified:
                    rows += f"{'Trust':<20} {fmt_verified(v1):<25} {fmt_verified(v2):<25}\n"
                if show_city:
                    rows += (
                        f"{'City':<20} "
                        f"{getattr(v1, 'city', 'N/A') or 'N/A':<25} "
                        f"{getattr(v2, 'city', 'N/A') or 'N/A':<25}\n"
                    )

                table = f"Here's a comparison of both vendors:\n\n{rows}"

                score1 = comparison_score(v1)
                score2 = comparison_score(v2)

                winner = v1 if score1 >= score2 else v2
                loser = v2 if score1 >= score2 else v1

                verdict = (
                    f"\n🏆 {getattr(winner, 'name', 'Vendor')} is the "
                    f"better overall choice based on ratings, reviews, and trust.\n"
                )

                explanation_prompt = (
                    f"Compare these two vendors for a user query: {user_message}\n\n"
                    f"{getattr(v1, 'name', 'Vendor 1')}: "
                    f"Price={fmt_price(getattr(v1, 'price_min', None), getattr(v1, 'price_max', None))}, "
                    f"Rating={getattr(v1, 'avg_rating', 0)} ({getattr(v1, 'review_count', 0)} reviews), "
                    f"Verified={getattr(v1, 'is_verified', False)}\n"
                    f"{getattr(v2, 'name', 'Vendor 2')}: "
                    f"Price={fmt_price(getattr(v2, 'price_min', None), getattr(v2, 'price_max', None))}, "
                    f"Rating={getattr(v2, 'avg_rating', 0)} ({getattr(v2, 'review_count', 0)} reviews), "
                    f"Verified={getattr(v2, 'is_verified', False)}\n\n"
                    f"Winner: {getattr(winner, 'name', 'Vendor')}\n\n"
                    f"Explain why the winner is stronger in 2-3 sentences. "
                    f"Mention when the other vendor may still be a better choice. "
                    f"End with two recommendation bullet points."
                )

                ai_result = await ai_service.execute_prompt(explanation_prompt)

                if ai_result.get("success"):
                    ai_explanation = f"\nWhy?\n\n{ai_result.get('response', '').strip()}"
                else:
                    ai_explanation = (
                        f"\nWhy?\n\n"
                        f"{getattr(winner, 'name', 'Vendor')} has stronger ratings, review history, "
                        f"and overall marketplace credibility.\n\n"
                        f"{getattr(loser, 'name', 'Vendor')} may still be a good choice depending on "
                        f"budget and personal preference.\n\n"
                        f"Recommendation:\n"
                        f"• Choose {getattr(winner, 'name', 'Vendor')} for overall reliability.\n"
                        f"• Consider {getattr(loser, 'name', 'Vendor')} if its pricing or style suits you better."
                    )

                response = table + verdict + ai_explanation

            # -----------------------------------
            # NO VENDORS FOUND
            # OPTIMIZATION: skip LLM call entirely
            # Return static response immediately
            # -----------------------------------

            elif len(vendors) == 0:

                category = filters.get("category", "vendors")
                city = filters.get("city", "")

                if city:
                    response = (
                        f"I couldn't find any {category} vendors in {city} "
                        f"matching your requirements. Try adjusting your budget "
                        f"or expanding your location."
                    )
                else:
                    response = (
                        f"I couldn't find any {category} vendors matching "
                        f"your requirements. Could you share your preferred city?"
                    )

            # -----------------------------------
            # STANDARD RECOMMENDATION RESPONSE
            # -----------------------------------

            else:

                vendor_names = ", ".join(
                    getattr(v, "name", "Unknown")
                    for v in vendors[:3]
                )

                category = filters.get("category", "vendors")
                city = filters.get("city", "")
                city_part = f" in {city}" if city else ""

                rec_prompt = (
                    f"A user asked: {user_message}\n"
                    f"Category: {category}, City: {city}\n"
                    f"Top vendors found: {vendor_names}\n\n"
                    f"Write a short, warm, friendly 2-3 sentence response "
                    f"confirming you found matching vendors. "
                    f"Sound like a helpful human assistant. "
                    f"Do not list vendors. Plain text only. No markdown."
                )

                try:
                    from app.services.prompt_service import PromptService

                    agent_prompt = PromptService.get_prompt("response_agent")

                    if agent_prompt:
                        print("[ResponseAgent] USING DB PROMPT from agent_prompts table")
                        system_prompt = "\n\n".join([
                            x for x in [
                                agent_prompt.base_prompt,
                                agent_prompt.role_instructions,
                                agent_prompt.behavior_guidelines,
                                agent_prompt.formatting_rules,
                                agent_prompt.business_rules,
                            ] if x
                        ])
                    else:
                        system_prompt = PromptLoader.get_prompt("ai_service_system")

                    if not system_prompt or not system_prompt.strip():
                        system_prompt = PromptLoader.get_prompt("ai_service_system")

                    response_client = LLMFactory.get_response_client()
                    response_model = LLMFactory.get_response_model()

                    completion = await asyncio.to_thread(
                        response_client.chat.completions.create,
                        model=response_model,
                        messages=[
                            {
                                "role": "system",
                                "content": system_prompt
                            },
                            {
                                "role": "user",
                                "content": rec_prompt
                            }
                        ],
                        temperature=0.7,
                        max_tokens=120
                    )
                    response = (completion.choices[0].message.content or "").strip()

                except Exception as e:
                    logger.warning(f"[ResponseAgent] Groq response failed, using fallback: {e}")
                    response = (
                        f"Great news! I found {len(vendors)} {category} vendor(s){city_part} "
                        f"matching your requirements. Check the recommendations below. 🎉"
                    )

            state["ai_response"] = response
            state["current_agent"] = "response_agent"

            trace = state.get("workflow_trace", [])
            trace.append({
                "agent": "response_agent",
                "status": "success",
                "intent": intent,
                "llm_called": intent in (
                    "comparison_query",
                    "vendor_recommendation"
                )
            })
            state["workflow_trace"] = trace

            return state

        except Exception as e:

            logger.error(f"[ResponseAgent] Exception: {str(e)}", exc_info=True)

            errors = state.get("errors", [])
            errors.append(str(e))
            state["errors"] = errors

            trace = state.get("workflow_trace", [])
            trace.append({
                "agent": "response_agent",
                "status": "failed",
                "error": str(e)
            })
            state["workflow_trace"] = trace

            return state