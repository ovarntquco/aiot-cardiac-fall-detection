idf_component_register(
    SRCS "nmea_parser.c" "neo6mgps_payload.c"
    REQUIRES
        esp_driver_uart
        esp_event
        time_sync
    INCLUDE_DIRS "include"
)