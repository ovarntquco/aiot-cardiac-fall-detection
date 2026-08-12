idf_component_register(
    SRCS "mqtt_.c"
    REQUIRES mqtt
    PRIV_REQUIRES
        mbedtls
        json_
        main
        max30102
    INCLUDE_DIRS "include"
)