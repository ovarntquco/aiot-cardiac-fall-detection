idf_component_register(
    SRCS "event_payload.c"
    PRIV_REQUIRES 
        time_sync
    INCLUDE_DIRS "include"
)