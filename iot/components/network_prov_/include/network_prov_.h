#ifndef NETWORK_PROV_HELPER_H
#define NETWORK_PROV_HELPER_H

#include "esp_err.h"

#ifdef __cplusplus
extern "C" {
#endif

#define NETWORKPROV_TAG "WIFI_PROV_S3"

esp_err_t network_prov_init();

#ifdef __cplusplus
}
#endif

#endif