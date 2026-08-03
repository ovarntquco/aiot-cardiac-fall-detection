idf_component_register(
    SRCS "network_prov_helper.c"
    PRIV_REQUIRES
        esp_driver_gpio
        esp_wifi
        main
        network_provisioning
        qrcode
    INCLUDE_DIRS "include"
)