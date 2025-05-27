import { createClient, parseConnectionString } from "@vercel/edge-config";

interface FeatureFlags {
    underMaintenance: boolean;
}

// We use prefixes to avoid mixing up the flags with other Edge Config values
const prefixKey = (key: string) => `ddroom_${key}`;

export async function get(key: keyof FeatureFlags) {
    const prefixedKey = prefixKey(key);
    const edgeConfig = createClient(process.env.EDGE_CONFIG);
    const featureFlag = await edgeConfig.get<FeatureFlags>(prefixedKey);
    return featureFlag;
}
