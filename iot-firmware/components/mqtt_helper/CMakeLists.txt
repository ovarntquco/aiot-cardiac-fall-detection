idf_component_register(
    SRCS "mqtt_helper.c"
    PRIV_REQUIRES mbedtls mqtt
    REQUIRES mqtt
    INCLUDE_DIRS "include"
)