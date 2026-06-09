from app.graphs.graph_state import (
    AgentState
)


class ErrorAgent:

    @staticmethod
    async def execute(
        state: AgentState
    ) -> AgentState:

        state["ai_response"] = (

            "Sorry, something went wrong while "
            "processing your request. Please try again."

        )

        state["current_agent"] = (
            "error_agent"
        )

        workflow = (
            state.get(
                "workflow_trace",
                []
            )
        )

        workflow.append(
            {
                "agent":
                "error_agent",

                "status":
                "executed",

                "errors":
                state.get(
                    "errors",
                    []
                )
            }
        )

        state["workflow_trace"] = (
            workflow
        )

        return state