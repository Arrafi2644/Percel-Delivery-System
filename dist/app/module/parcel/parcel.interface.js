"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelType = exports.ParcelStatus = void 0;
var ParcelStatus;
(function (ParcelStatus) {
    ParcelStatus["REQUESTED"] = "REQUESTED";
    ParcelStatus["APPROVED"] = "APPROVED";
    ParcelStatus["DISPATCHED"] = "DISPATCHED";
    ParcelStatus["IN_TRANSIT"] = "IN_TRANSIT";
    ParcelStatus["DELIVERED"] = "DELIVERED";
    ParcelStatus["CANCELLED"] = "CANCELLED";
    ParcelStatus["BLOCKED"] = "BLOCKED";
})(ParcelStatus || (exports.ParcelStatus = ParcelStatus = {}));
var ParcelType;
(function (ParcelType) {
    ParcelType["DOCUMENT"] = "DOCUMENT";
    ParcelType["ELECTRONICS"] = "ELECTRONICS";
    ParcelType["CLOTHING"] = "CLOTHING";
    ParcelType["FOOD"] = "FOOD";
    ParcelType["FRAGILE"] = "FRAGILE";
    ParcelType["HEAVY_ITEM"] = "HEAVY_ITEM";
    ParcelType["OTHER"] = "OTHER";
})(ParcelType || (exports.ParcelType = ParcelType = {}));
