#ifndef MQTT_HELPER_H
#define MQTT_HELPER_H

#include "esp_err.h"

#include "mqtt_client.h"

#ifdef __cpluscplus
extern "C" {
#endif

static const char* MQTT_TAG = "MQTT";

esp_err_t mqtt_init(esp_mqtt_client_handle_t* mqtt_client);

#ifdef __cpluscplus
}
#endif

#endif