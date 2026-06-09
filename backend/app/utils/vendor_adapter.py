from types import SimpleNamespace


class VendorAdapter:

    @staticmethod
    def adapt(vendor_dict):

        if not isinstance(vendor_dict, dict):
            return vendor_dict

        return SimpleNamespace(
            **vendor_dict
        )