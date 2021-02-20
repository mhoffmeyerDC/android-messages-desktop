import { BehaviorSubject } from "rxjs";
import jetpack from "fs-jetpack";
import { SETTINGS_FILE } from "./constants";

// base types in json
type primative = null | boolean | number | string;
// expression of json arrays
type jsonArr = validJson[];
// recursive interface with all valid expressions of json inside of an object
interface json {
  [key: string]: json | primative | jsonArr;
}

// a complete expression of json including root arrays, primatives, and objects
type validJson = primative | jsonArr | json;

export type Setting<T extends validJson> = BehaviorSubject<T>;

function getSetting(key: string): validJson | undefined {
  return (jetpack.read(SETTINGS_FILE(), "json") || {})[key];
}

/**
 *
 * initial must be a json serializable type
 *
 * @param key name of setting
 * @param initial initial value if unset
 */
function createSetting<T>(key: string, initial: T): BehaviorSubject<T> {
  const savedVal = getSetting(key);
  const val = savedVal != null ? savedVal : initial;
  return new BehaviorSubject(val) as BehaviorSubject<T>;
}

export const trayEnabled = createSetting("trayEnabled", false);

export const notificationSoundEnabled = createSetting(
  "notificationSoundEnabled",
  false
);
export const hideNotificationContentEnabled = createSetting(
  "hideNotificationContentEnabled",
  false
);
export const respectSystemDarkModeEnabled = createSetting(
  "respectSystemDarkModeEnabled",
  true
);
export const startInTrayEnabled = createSetting("startInTrayEnabled", false);
export const autoHideMenuEnabled = createSetting("autoHideMenuEnabled", false);
export const seenMinimizeToTrayWarning = createSetting(
  "seenMinimizeToTrayWarning",
  false
);
export const seenResetSettingsWarning = createSetting(
  "seenResetSettingsWarning",
  false
);

export interface Settings {
  trayEnabled: Setting<boolean>;
  notificationSoundEnabled: Setting<boolean>;
  hideNotificationContentEnabled: Setting<boolean>;
  respectSystemDarkModeEnabled: Setting<boolean>;
  startInTrayEnabled: Setting<boolean>;
  autoHideMenuEnabled: Setting<boolean>;
  seenMinimizeToTrayWarning: Setting<boolean>;
  seenResetSettingsWarning: Setting<boolean>;
}

export const settings: Settings = {
  trayEnabled,
  notificationSoundEnabled,
  hideNotificationContentEnabled,
  respectSystemDarkModeEnabled,
  startInTrayEnabled,
  autoHideMenuEnabled,
  seenMinimizeToTrayWarning,
  seenResetSettingsWarning,
};

if (!jetpack.exists(SETTINGS_FILE())) {
  jetpack.write(SETTINGS_FILE(), {});
}

Object.entries(settings).forEach(([name, setting]) => {
  setting.subscribe((val: boolean) => {
    const data = jetpack.read(SETTINGS_FILE(), "json") || {};
    data[name] = val;
    jetpack.write(SETTINGS_FILE(), data);
  });
});
