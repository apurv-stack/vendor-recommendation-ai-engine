from uuid import UUID

from pydantic import (

    BaseModel,
    EmailStr,
    Field,
    field_validator,
    model_validator

)

import re


# ==========================================
# CREATE VENDOR
# ==========================================

class CreateVendorRequest(BaseModel):

    name: str = Field(

        min_length=2,

        max_length=255

    )

    business_email: EmailStr

    contact_phone: str = Field(

        min_length=10,

        max_length=15

    )

    city: str | None = Field(

        default=None,

        min_length=2,

        max_length=255

    )

    address: str | None = Field(

        default=None,

        max_length=500

    )

    description: str | None = Field(

        default=None,

        max_length=1000

    )

    @field_validator("name")

    @classmethod

    def validate_name(

        cls,

        value

    ):

        value=value.strip()

        if not value:

            raise ValueError(

                "Vendor name cannot be empty"

            )

        return value

    @field_validator("contact_phone")

    @classmethod

    def validate_phone(

        cls,

        value

    ):

        cleaned=(

            value

            .replace(" ","")

            .replace("-","")

            .replace("(","")

            .replace(")","")

            .replace("+","")

        )

        if not cleaned.isdigit():

            raise ValueError(

                "Phone number must contain only digits"

            )

        if len(cleaned)!=10:

            raise ValueError(

                "Phone number must contain exactly 10 digits"

            )

        return cleaned


# ==========================================
# SERVICE
# ==========================================

class ServiceResponse(

    BaseModel

):

    service_id: UUID

    name: str = Field(validation_alias="service_name")

    class Config:

        from_attributes=True
        populate_by_name = True


# ==========================================
# INTERNAL TEAM
# ==========================================

class ManagedTeamRequest(

    BaseModel

):

    team_name:str=Field(

        min_length=2,

        max_length=100

    )

    category_id:UUID|None=None

    description:str|None=Field(

        default=None,

        max_length=500

    )

    @field_validator(

        "team_name"

    )

    @classmethod

    def validate_team(

        cls,

        value

    ):

        value=value.strip()

        if not value:

            raise ValueError(

                "Team name cannot be empty"

            )

        return value


class ManagedTeamResponse(

    BaseModel

):

    vendor_id: UUID

    name: str

    parent_vendor_id: UUID | None

    services: list[ServiceResponse] = Field(
        default=[],
        validation_alias="service_records"
    )

    class Config:

        from_attributes=True
        populate_by_name = True


# ==========================================
# PROFILE BASE
# ==========================================

class VendorProfileBase(

    BaseModel

):

    name:str|None=Field(

        default=None,

        min_length=2,

        max_length=255

    )

    slug:str|None=Field(

        default=None,

        min_length=2,

        max_length=255

    )

    description:str|None=Field(

        default=None,

        max_length=1000

    )

    category_id:UUID|None=None

    city:str|None=Field(

        default=None,

        min_length=2,

        max_length=255

    )

    address:str|None=Field(

        default=None,

        max_length=500

    )

    business_email:EmailStr|None=None

    contact_phone:str|None=None

    price_min:int|None=Field(

        default=None,

        ge=0

    )

    price_max:int|None=Field(

        default=None,

        ge=0

    )

    is_available:bool|None=True

    @field_validator(

        "contact_phone"

    )

    @classmethod

    def validate_phone(

        cls,

        value

    ):

        if value is None:

            return value

        cleaned=(

            value

            .replace(" ","")

            .replace("-","")

            .replace("(","")

            .replace(")","")

            .replace("+","")

        )

        if not cleaned.isdigit():

            raise ValueError(

                "Phone number invalid"

            )

        if len(cleaned)!=10:

            raise ValueError(

                "Phone number must contain exactly 10 digits"

            )

        return cleaned

    @field_validator(

        "slug"

    )

    @classmethod

    def validate_slug(

        cls,

        value

    ):

        if value is None:

            return value

        value=(

            value

            .strip()

            .lower()

        )

        if not re.match(

            r"^[a-z0-9-]+$",

            value

        ):

            raise ValueError(

                "Slug invalid"

            )

        return value

    @model_validator(

        mode="after"

    )

    def validate_price(

        self

    ):

        if(

            self.price_min

            is not None

            and

            self.price_max

            is not None

            and

            self.price_min>

            self.price_max

        ):

            raise ValueError(

                "Minimum price cannot exceed maximum price"

            )

        return self


# ==========================================
# UPDATE
# ==========================================

class VendorProfileUpdateRequest(

    VendorProfileBase

):

    pass


# ==========================================
# SEARCH
# ==========================================

class VendorSearchRequest(

    BaseModel

):

    query:str|None=None

    city:str|None=None

    category:str|None=None

    min_price:int|None=None

    max_price:int|None=None

    rating:float|None=None

    min_reviews:int|None=None

    available:bool|None=None

    verified:bool|None=None

    sort_by:str|None=None

    page:int=1

    limit:int=10


# ==========================================
# RESPONSE
# ==========================================

class VendorResponse(

    BaseModel

):

    vendor_id:UUID

    user_id:UUID|None

    parent_vendor_id:UUID|None

    name:str|None

    slug:str|None

    description:str|None

    category_id:UUID|None

    city:str|None

    address:str|None

    business_email:EmailStr|None

    contact_phone:str|None

    price_min:int|None

    price_max:int|None

    avg_rating:float

    review_count:int

    is_available:bool

    is_verified:bool

    is_active:bool

    is_rejected:bool=False

    managed_teams:list[
        ManagedTeamResponse
    ]=[]

    class Config:

        from_attributes=True


# ==========================================
# DETAIL
# ==========================================

class VendorDetailResponse(

    BaseModel

):

    success:bool

    message:str

    vendor:VendorResponse


# ==========================================
# LIST
# ==========================================

class VendorListResponse(

    BaseModel

):

    success:bool

    message:str

    page:int

    limit:int

    total_results:int

    vendors:list[
        VendorResponse
    ]

# ==========================================
# IMPORT — SINGLE ITEM
# ==========================================

class VendorImportItem(BaseModel):

    name: str = Field(min_length=2, max_length=255)

    business_email: EmailStr

    contact_phone: str = Field(min_length=10, max_length=15)

    city: str | None = Field(default=None, max_length=255)

    address: str | None = Field(default=None, max_length=500)

    description: str | None = Field(default=None, max_length=1000)

    category: str | None = Field(default=None, max_length=100)

    price_min: int | None = Field(default=None, ge=0)

    price_max: int | None = Field(default=None, ge=0)

    is_available: bool = True

    is_verified: bool = False

    avg_rating: float = Field(default=0.0, ge=0.0, le=5.0)

    review_count: int = Field(default=0, ge=0)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value):
        value = value.strip()
        if not value:
            raise ValueError("Vendor name cannot be empty")
        return value

    @field_validator("contact_phone")
    @classmethod
    def validate_phone(cls, value):
        cleaned = (
            value.replace(" ", "").replace("-", "")
            .replace("(", "").replace(")", "").replace("+", "")
        )
        if not cleaned.isdigit():
            raise ValueError("Phone number must contain only digits")
        if len(cleaned) != 10:
            raise ValueError("Phone number must be exactly 10 digits")
        return cleaned

    @model_validator(mode="after")
    def validate_price_range(self):
        if (
            self.price_min is not None
            and self.price_max is not None
            and self.price_min > self.price_max
        ):
            raise ValueError("price_min cannot exceed price_max")
        return self


# ==========================================
# IMPORT — REQUEST
# ==========================================

class VendorImportRequest(BaseModel):

    vendors: list[VendorImportItem] = Field(min_length=1)


# ==========================================
# IMPORT — RESPONSE
# ==========================================

class VendorImportResponse(BaseModel):

    success: bool

    total: int

    imported: int

    failed: int

    errors: list[str] = []