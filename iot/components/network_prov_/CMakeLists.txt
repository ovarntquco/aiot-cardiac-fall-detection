idf_component_register(
    SRCS "network_prov_.c"
    PRIV_REQUIRES
        esp_driver_gpio
        esp_wifi
        network_provisioning
        qrcode
        main
    INCLUDE_DIRS "include"
)