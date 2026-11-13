# Integrations

## Biomes Lite

The biome definitions are adapted from Biomes Lite 1.2.2-up0 by TATAPSTAR: https://github.com/Planetary-Annihilation-Fandom/com.pa.biomes.lite.server. They support the Godblessed Map Generator integrated into the client repository. The client contains the corresponding definitions and visual assets.

The desert and lava Lite definitions retain their terrain composition but use the atmosphere, lighting and water settings from Ferret’s Better Biome Visuals by ferretmaster: https://github.com/Ferret-Master/Ferrets-Better-Biome-Visuals.

## Legion Expansion

The complete upstream CC BY-NC-SA 4.0 and JavaScript MIT terms are retained in [licenses/legion-expansion.txt](licenses/legion-expansion.txt); original notices and component-specific terms are indexed in [licenses/README.md](licenses/README.md).

The Legion units, AI build plans and the changes to standard units are from Legion Expansion 1.33.1-124674 by nicb1, Crembels, KillerKiwiJuice, Anonemous2, mgmetal13, zx0, Luther, Alpha2546, PRoeleert, wondible, mikeyh, Quitch, Stuart98, dom314, CptConundrum, Elodea, AndreasG, Clopse, Graushwein, N30N, Qzipco, WPMarshall and xankar: https://github.com/Legion-Expansion/Legion-Expansion. They are integrated under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (https://creativecommons.org/licenses/by-nc-sa/4.0/). The client repository contains the assets and interface.

## Exiles

Exiles 0.8.5.3.3 by NikolaMX and BOIYOUSAYWHAT: https://github.com/NikolaMX/Exiles-Faction. The source MIT license is retained in [licenses/exiles.txt](licenses/exiles.txt). Units, models, textures, effects, strategic icons and AI data are integrated into Dynastiya; the original server and client mods are not required. Shared standard-unit data is merged with Legion.

Exiles/Legion interception compatibility is adapted from Faction Compatibility Mod 1.9 by Ferretmaster (https://github.com/Ferret-Master/Commander-Merger), under CC BY-NC-SA 4.0; see [licenses/faction-compatibility.txt](licenses/faction-compatibility.txt). Only the relevant target lists are merged, preserving existing weapon settings.

Broken source effect paths are corrected; unavailable animations fall back to the model bind pose. Exiles copies of shared ammunition use private paths to preserve existing MLA/Legion balance, while interception target lists recognize both variants. The orbital launcher retains its original build filter (`Orbital & FactoryBuild & Basic & Custom58`) and uses the standard MLA orbital units supplied by Titans.

## Bug Faction

Bug Faction 1.40 by Ferretmaster, BillTheBlueBot, Anonemous2, Taiga, Quitch and Quildtide: https://github.com/Ferret-Master/Bug-Faction. The source MIT license is retained in [licenses/bug-faction.txt](licenses/bug-faction.txt). Units, research, models, effects, AI, strategic icons, audio and commander artwork are integrated; the original mods are not required. Lobby frames, player icons and build tabs register with the shared faction module. Research is applied while constructing build sets, without delayed slot mutations.

Missing source effect and model references are repaired. Animation adapters preserve available clips and omit references to clips or skeleton controls absent from the shipped meshes. The source menu theme switcher and external FloatZone dependency are replaced by the shared overview and research dialog. Interception targets are merged with existing MLA/Legion defenses, using the already integrated Faction Compatibility license.

## Second Wave Expansion

Second Wave Expansion 0.16.1 by Anonemous2, billthebluebot, Taiga, Quitch, Quildtide, Ferretmaster, Tatarstan and DrWondertainment: https://github.com/Anonemous2/pa.mla.unit.addon, https://forums.planetaryannihilation.com/threads/wip-casual-mla-unit-addon.73484/. The source does not include a license file. The MLA, Legion and Bugs units, ammunition, changes to the anti-air defenses and AI build plans are integrated; the original mod is not required. The client repository contains the textures, strategic icons and build bar positions.

Units are added to the existing unit list, and Second Wave missiles are added to the Legion shield interception targets. The `stalker` and `swordfish` strategic icons are renamed `sw_stalker` and `sw_swordfish` to avoid the Exiles icons of the same name. The Legion advanced storage death weapon path is corrected, and two unreferenced skirt specifications with broken paths are removed.
