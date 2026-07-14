#include <stdio.h>
#include <string.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"

#include "driver/gpio.h"

#include "esp_log.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "nvs_flash.h"

#include "network_provisioning/manager.h"
#include "network_provisioning/scheme_softap.h"


#include "qrcode.h"

#include "include/network_prov_helper.h"

static const char *TAG = "WIFI_PROV_S3";


bool wifi_prov_is_provisioned(void) {
    bool provisioned = false;
    ESP_ERROR_CHECK(network_prov_mgr_is_wifi_provisioned(&provisioned));
    
    return provisioned;
}

void main() {
    esp_err_t err = nvs_flash_init();

    bool provisioned = is_provisioned();

    if (!provisioned) {
        ESP_LOGI(TAG, "Starting provisioning mode...");
    } else {
        ESP_LOGI(TAG, "Already provisioned, starting Wi-Fi STA");

    }
}