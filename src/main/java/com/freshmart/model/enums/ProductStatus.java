package com.freshmart.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ProductStatus {
    IN_STOCK("Còn hàng"),
    OUT_OF_STOCK("Hết hàng");

    private final String label;

    ProductStatus(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static ProductStatus fromValue(String value) {
        if (value == null) {
            return null;
        }
        switch (value.trim().toLowerCase()) {
            case "còn hàng":
            case "con hang":
            case "in_stock":
            case "in stock":
            case "instock":
                return IN_STOCK;
            case "hết hàng":
            case "het hang":
            case "out_of_stock":
            case "out of stock":
            case "outofstock":
                return OUT_OF_STOCK;
            default:
                throw new IllegalArgumentException("Trạng thái sản phẩm không hợp lệ: " + value);
        }
    }
}
