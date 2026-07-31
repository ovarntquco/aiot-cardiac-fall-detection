#ifndef TIME_SYNC_H
#define TIME_SYNC_H

#include <stdio.h>

#include "esp_err.h"

#ifdef __cplusplus
extern "C" {
#endif

esp_err_t time_sync_init();
void get_iso8601_now(char* buf, size_t buf_size);

#ifdef __cplusplus
}
#endif

#endif