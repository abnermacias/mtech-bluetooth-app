export type DiscoveredDevice = {
    deviceId: string;
    name: string | undefined;
    manufacturerData: { [key: string]: DataView } | undefined;
    rawAdvertisement: DataView | undefined;
    serviceData: { [key: string]: DataView } | undefined;
    uuids: string[] | undefined;
}