import { cardKeeperAppStoreUrl, cardKeeperRelease } from './cardKeeperPage';

export interface Project {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  status: 'released' | 'opensource' | 'development';
  featured: boolean;
  icon?: string;
  tags: string[];
  appstore?: string;
  github?: string;
  page?: string;
}

export const projects: Project[] = [
  {
    name: "RunnersHeart",
    slug: "runners-heart",
    tagline: "Heart Rate Zone Running Coach",
    description: "Train smarter with live heart rate zone feedback, Apple Watch haptics, personalized zones, and richer iPhone workout analysis.",
    status: "released",
    featured: true,
    icon: "/assets/images/projects/runners-heart-icon.png",
    tags: ["SwiftUI", "HealthKit", "watchOS", "TRIMP"],
    appstore: "https://apps.apple.com/us/app/runners-heart/id6758222219",
    page: "/runners-heart/",
  },
  {
    name: "Card Keeper",
    slug: "cards",
    tagline: "Scan a card, fill checkout",
    description: "Keep payment cards and membership barcodes in iCloud Keychain on iPhone and Mac, fill Safari checkout forms after authentication, and show barcodes in a Home Screen widget.",
    status: cardKeeperRelease.ios ? "released" : "development",
    featured: true,
    icon: "/cards/images/card-keeper-icon.png",
    tags: ["iPhone", ...(cardKeeperRelease.mac ? ["Mac"] : []), "Safari Extension", "iCloud Keychain", "Widget"],
    appstore: cardKeeperRelease.ios ? cardKeeperAppStoreUrl : undefined,
    page: "/cards/",
  },
  {
    name: "RemoteDebug",
    slug: "remotedebug",
    tagline: "Debug Builds to iPhone over Tailscale",
    description: "Publish development-signed Debug builds from a Mac and install them on a paired iPhone over Tailscale. Notarized Mac app; the iPhone app is built from source.",
    status: "opensource",
    featured: true,
    tags: ["SwiftUI", "Tailscale", "NetworkExtension", "MCP"],
    github: "https://github.com/oozoofrog/remotedebug",
    page: "/remotedebug/",
  },
  {
    name: "Tesella",
    slug: "tesella",
    tagline: "Photo Mosaic Generator",
    description: "Reconstruct target photos as tile mosaics using images from your photo library. Built with Swift 6 Strict Concurrency and TDD.",
    status: "development",
    featured: true,
    icon: "/assets/images/projects/tesella-icon.png",
    tags: ["SwiftUI", "Vision", "Swift 6", "TDD"],
  },
  {
    name: "PhotoCleaner",
    slug: "photocleaner",
    tagline: "Photo Library Cleaner",
    description: "Detect and clean up failed iCloud downloads, corrupted photos, duplicates, and large files in your photo library.",
    status: "development",
    featured: true,
    icon: "/assets/images/projects/photocleaner-icon.png",
    tags: ["SwiftUI", "PhotoKit", "Vision", "CryptoKit"],
  },
  {
    name: "Textify",
    slug: "textify",
    tagline: "Image to Text Art",
    description: "Convert images to ASCII/Unicode text art. Metal-based image processing with modular architecture.",
    status: "development",
    featured: true,
    tags: ["SwiftUI", "Metal", "Swift 6", "MVVM"],
  },
  {
    name: "Unicody",
    slug: "unicody",
    tagline: "Unicode Text Decoration",
    description: "Zalgo text, font style conversion, and Unicode text decorations with a custom keyboard extension.",
    status: "development",
    featured: true,
    tags: ["SwiftUI", "UIKit", "Keyboard Extension", "Swift 6"],
  },
];
