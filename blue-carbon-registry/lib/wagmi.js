import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, polygonAmoy } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Blue Carbon Registry",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [
    // Set the default based on the environment - development uses Amoy, production uses Polygon
    ...(process.env.NODE_ENV === "development" ? [polygonAmoy] : [polygon]),
  ],
  ssr: true,
});
