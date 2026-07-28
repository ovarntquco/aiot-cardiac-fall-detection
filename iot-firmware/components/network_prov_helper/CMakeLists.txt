idf_component_register(
    SRCS "network_prov_helper.c"
    PRIV_REQUIRES esp_wifi esp_driver_gpio network_provisioning qrcode
    INCLUDE_DIRS "include"
)