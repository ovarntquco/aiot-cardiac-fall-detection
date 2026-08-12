idf_component_register(
    SRCS "json_.c"
    REQUIRES
        event_payload
        max30102
        mpu6050
        nmea_parser
    PRIV_REQUIRES
        cjson
        main 
    INCLUDE_DIRS "include"
)