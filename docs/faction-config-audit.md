# Чужие и общие конфиги в исходных фракциях

Проверка и интеграция по [задаче №46](https://github.com/Planetary-Annihilation-Fandom/pa.dynastiya.server/issues/46), 13 ноября 2026 года. Правка Bug Faction для легионовского Investigator внедрена: радиус обнаружения мин увеличен со 150 до 200.

## Принятые изменения

Щит Legion получил 42 недостающие цели. Его список теперь содержит 144 уникальных пути и включает все 131 боеприпас из четырёх исходных модов с `physics.add_to_spatial_db: true`, включая наследование, и пять отдельных вариантов Exiles. Флаг у этих боеприпасов уже был перенесён; дополнительных изменений физики не потребовалось. Семь файлов с таким же флагом оказались юнитами или спецификациями оружия, поэтому как боеприпасы не добавлялись.

Для выбора подводных и орбитальных снарядов `target_layers` щита изменён с `WL_Air` на `WL_AnyLayer`. Ограничение по явному списку боеприпасов и запрет перехвата юнитов сохранены. Дальность, скорострельность и энергозатраты не менялись; прежние цели, включая удалённые в исходнике Second Wave, сохранены.

Характеристики Second Wave уже соответствовали исходнику и оставлены. Отдельные боеприпасы Exiles, общие эффекты фазового перехода и общие AI-фильтры также сохранены. Из документа о публикации удалены упоминания Biomes Lite: его интеграция описывается в общем перечне исходных модов.

## Границы проверки

Проверены локальные исходники из `mods/downloaded`: все 1564 JSON-файла под `pa/` четырёх серверных модов. Сопоставлены совпадающие виртуальные пути с игрой TITANS build 124685 и с другими исходными фракциями, затем — с серверной частью «Династии». Для штатных конфигов использован файл из `media/pa_ex1`, если он существует, иначе из `media/pa`. Сравнивается содержимое JSON, без учёта форматирования и порядка ключей; массивы сравниваются с учётом порядка.

Это инвентаризация прямых переопределений JSON: она не определяет авторство копий, переименованных в новые пути, и не охватывает PFX, модели, текстуры или JavaScript. В клиентских дополнениях этих четырёх модов JSON-конфигов чужих юнитов не обнаружено: кроме манифестов, у Bugs есть собственные `selection_list.json`, `bug_scorch.json` и `bug_scorch_material.json`.

| Исходник | Папка в `mods/downloaded` | Версия | Проверено JSON | Конфиги юнитов, оружия и боеприпасов по общим/чужим путям | Общие AI-файлы | Общие списки |
|---|---|---|---:|---:|---:|---:|
| Legion | `com.pa.legion-expansion-server` | 1.33.1-124674 | 554 | 41 MLA/TITANS | 0 | 2 |
| Exiles | `com.pa.nik.exiles` | 0.8.5.3.3 | 427 | 12 MLA/TITANS | 2 | 1 |
| Bugs | `com.pa.ferretmaster.bugs` | 1.40 | 362 | 1 Legion | 2 | 2 |
| Second Wave | `pa.mla.unit.addon` | 0.16.1 | 221 | 3 MLA/TITANS + 1 Legion | 0 | 1 |

Всего 58 копий конфигов по 51 уникальному пути, отдельно от AI и списков. В число копий входит `air_defense.json` из Second Wave, который полностью совпадает с TITANS. Новые юниты Second Wave в `addon`, `l_addon` и `b_addon` предназначены для нескольких фракций, но не заменяют существующие конфиги по тем же путям.

## Bugs: правка Investigator

Единственный чужой конфиг юнита — `pa/units/land/l_scout_bot/l_scout_bot.json`. Между исходниками Legion и Bugs различается только `recon.observer.items`: у наблюдателя с `layer: "mine"` радиус меняется со 150 на 200. Обзор поверхности, воздуха и подводного слоя остаётся 150; стоимость, здоровье, движение и инструменты совпадают.

Текущий [конфиг «Династии»](../pa/units/land/l_scout_bot/l_scout_bot.json) целиком совпадает с вариантом Bugs. Прежде он совпадал с Legion; по решению пользователя перенесено увеличение радиуса обнаружения мин.

## Legion: изменения штатных юнитов

Все 41 переопределение относятся к MLA/TITANS:

- 27 боеприпасов получают `physics.add_to_spatial_db: true` и собственные эффекты попадания и/или полёта. Относительно TITANS их урон, стоимость и скорость здесь не меняются.
- Восемь конфигов оружия расширяют `anti_entity_targets`: защита от ядерных ракет, тактических снарядов, десантных капсул и средства перехвата получают цели Legion.
- Четыре юнита получают дополнительный радар `surface_and_air` с `uses_energy: true`: `fabrication_bot_combat` и `fabrication_bot_combat_adv` — 100, `land_scout` — 200, `fabrication_barge` — 150. Это новый канал обнаружения; радиусы штатного зрения не меняются.
- У `metal_extractor` и `metal_extractor_adv` расширены `replaceable_units`, чтобы учитывать соответствующие экстракторы Legion.

В «Династии» 38 файлов совпадают с Legion. В трёх остальных (`support_platform_tool_interception`, `anti_nuke_launcher_tool_weapon`, `bot_sniper_beam_tool_weapon`) сохранены его параметры и дополнены списки целей для других интегрированных фракций. Точные пути приведены ниже.

## Exiles: общие основы и отдельные боеприпасы

Все 12 переопределений относятся к MLA/TITANS; прямых замен уникальных конфигов Legion или Bugs нет. В частности, `air/bomber_heavy/bomber_heavy_ammo.json` существует в штатном `pa_ex1`, хотя его также меняет Legion.

| Конфиг | Отличие исходника Exiles от TITANS | Состояние в «Династии» |
|---|---|---|
| `pa/ammo/torpedo/torpedo.json` | `add_to_spatial_db: false → true` | Совпадает с Exiles |
| `air/base_flyer/base_flyer.json` | Добавлен эффект `phasing` `/pa/effects/mini_tp.pfx` | Совпадает с Exiles |
| `land/base_bot/base_bot.json` | Эффект `phasing` заменён на `mini_tp.pfx`, изменена ориентация | Совпадает с Exiles |
| `land/base_structure/base_structure.json` | Добавлен `phasing` `mini_tp.pfx` | Совпадает с Exiles |
| `land/base_vehicle/base_vehicle.json` | Добавлен `phasing` `mini_tp.pfx` | Совпадает с Exiles |
| `air/bomber/bomber_ammo.json` | Пространственная регистрация; `splash_damage: 50 → 75`, `splash_radius: 12 → 10` | Точная копия в `pa/ammo/exiles_compat/bomber/` |
| `air/bomber_heavy/bomber_heavy_ammo.json` | Пространственная регистрация; `damage` и `splash_damage: 2500 → 5000` | Точная копия в `pa/ammo/exiles_compat/bomber_heavy/` |
| `land/artillery_long/artillery_long_ammo.json` | `add_to_spatial_db: false → true` | Точная копия в `pa/ammo/exiles_compat/artillery_long/` |
| `land/artillery_short/artillery_short_ammo.json` | Добавлено `add_to_spatial_db: true` | Точная копия в `pa/ammo/exiles_compat/artillery_short/` |
| `land/tank_heavy_mortar/tank_heavy_mortar_ammo.json` | Пространственная регистрация; `splash_damage: 300 → 400` | Точная копия в `pa/ammo/exiles_compat/tank_heavy_mortar/` |
| `land/titan_vehicle/titan_vehicle_ammo_main.json` | `add_to_spatial_db: false → true` | Совпадает с Exiles |
| `land/anti_nuke_launcher/anti_nuke_launcher_tool_weapon.json` | В целях присутствуют ядерный боеприпас Bugs и три ракеты Exiles | Цели объединены с Legion; исходные цели Exiles сохранены |

Пути без начального `pa/` в таблице отсчитываются от `pa/units/`. Пять отдельных боеприпасов уже описаны в [интеграции Exiles](../Integrations.md#exiles): исходные общие пути сохраняют вариант Legion. Общие базовые спецификации Exiles остаются по штатным путям, поэтому наследующие их юниты других фракций тоже получают эти эффекты.

## Second Wave: ПВО и перехват

| Конфиг под `pa/units/` | Отличие от владельца пути | Состояние в «Династии» |
|---|---|---|
| `land/air_defense/air_defense.json` | Полностью совпадает с TITANS | Совпадает с исходником |
| `land/air_defense_adv/air_defense_adv.json` | Только `alt_area_build_separation: 58 → 30` | Совпадает с исходником |
| `land/bot_sniper/bot_sniper_beam_tool_weapon.json` | В цели добавлен `addon/naval_anti_orbital_ship/naval_anti_orbital_ammo.json` | Цели объединены с Legion |
| `land/l_shield_gen/anti_entity_targets.json` | К списку Legion добавлены 9 боеприпасов Second Wave, удалены 14 авиационных боеприпасов MLA/Legion | Все 9 добавлений присутствуют; 14 исходных авиационных целей Legion сохранены |

Таким образом, исходный файл щита Second Wave нельзя считать простым дополнением к Legion: он также удаляет цели. В «Династии» используется объединённый список, а не полная замена этим файлом.

## Общие AI-конфиги и списки

У Exiles переопределены `pa/ai/platoon_builds/platoon_land_builds.json` и `pa/ai/platoon_templates/platoon_templates.json`. Изменены общие фильтры состава наземных взводов: среди прочего, добавлены `Offense` и исключения для специальных ролей, у взрывных ботов требуется `Mobile`, из шаблона `UnitCannon` исключён `Custom6`. В «Династии» оба файла целиком совпадают с Exiles и остаются общими; ограничителя на фракцию Exiles в этих файлах нет.

У Bugs есть штатные пути `pa/ai/platoon_builds/platoon_misc_builds.json` и `platoon_orbital_builds.json`, где изменяются выбор шаблонов и фильтры. В «Династии» они размещены в подпапке `bugs/`: оставлен отдельный план Unit Cannon, орбитальные планы переименованы с префиксом Bugs, а фильтры выбора из пула ограничены `Custom2`. Штатные файлы по исходным путям ими не заменяются.

Все четыре серверных исходника содержат общий `pa/units/unit_list.json`; Legion и Bugs также содержат `pa/units/commanders/commander_list.json`. Это списки регистрации, а не изменения характеристик. В «Династии» они объединены, поэтому не совпадают целиком с отдельными исходниками.

## Как повторить проверку

Из корня серверного репозитория:

```powershell
python tools/audit_faction_configs.py --sources ../../downloaded --game 'C:/workroot/software/steam/steamapps/common/Planetary Annihilation Titans/media'
```

[Скрипт](../tools/audit_faction_configs.py) читает файлы и печатает JSON в stdout. `sources` содержит версии, число файлов и SHA-256 снимка всех `pa/**/*.json`; `overrides` — исходник, путь, основу сравнения, отличия от основы и от «Династии». `integrated` описывает файл по исходному пути: `source` — совпадает с исходником, `baseline` — с основой, `different` — отличается от обоих, `missing` — отсутствует по этому пути. Переносы Exiles и AI Bugs показаны отдельно в `relocated_path` и `source_to_relocated`; пустой список отличий означает точное совпадение JSON.

Для нештатного пути основой служит первый поставщик в порядке Legion, Exiles, Bugs, Second Wave. Этот порядок выявляет совпадения путей и не моделирует порядок загрузки модов. Переименованные копии и поведение наследования `base_spec` требуют отдельного анализа; скрипт их не вычисляет.

Конфиги проверены статически: покрытие щита, наследование пространственного флага, сохранение прежних целей, характеристик Second Wave и отдельных боеприпасов Exiles. Игра по указанию пользователя не запускалась; поведение перехвата в бою этим сравнением не проверяется.

## Полный перечень прямых переопределений

Пути в таблице виртуальные, от корня мода. «Исходник» означает полное совпадение с исходным модом; «Объединён» — проверенное расширение списка целей, сохраняющее остальные поля; переносы указаны отдельно.

| Исходник | Путь | Основа | В «Династии» |
|---|---|---|---|
| Legion | `pa/units/air/bomber/bomber_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/air/bomber_heavy/bomber_heavy_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/air/gunship/gunship_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/air/strafer/strafer_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/air/support_platform/support_platform_tool_interception.json` | MLA/TITANS | Объединён |
| Legion | `pa/units/land/anti_nuke_launcher/anti_nuke_launcher_tool_weapon.json` | MLA/TITANS | Объединён |
| Legion | `pa/units/land/artillery_long/artillery_long_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/artillery_short/artillery_short_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/assault_bot/assault_bot_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/assault_bot_adv/assault_bot_adv_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/attack_vehicle/attack_vehicle_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/bot_grenadier/bot_grenadier_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/bot_sniper/bot_sniper_beam_tool_weapon.json` | MLA/TITANS | Объединён |
| Legion | `pa/units/land/bot_tactical_missile/bot_tactical_missile_tool_antidrop.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/bot_tesla/bot_tesla_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/fabrication_bot_combat/fabrication_bot_combat.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/fabrication_bot_combat_adv/fabrication_bot_combat_adv.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/land_scout/land_scout.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/laser_defense/laser_defense_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/laser_defense_adv/laser_defense_adv_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/laser_defense_single/laser_defense_single_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/metal_extractor/metal_extractor.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/metal_extractor_adv/metal_extractor_adv.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/tactical_missile_launcher/tactical_missile_tool_antidrop.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/tank_anti_nuke/tank_anti_nuke_tool_weapon.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/tank_heavy_armor/tank_heavy_armor_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/tank_heavy_mortar/tank_heavy_mortar_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/tank_hover/tank_hover_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/tank_laser_adv/tank_laser_adv_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/land/tank_light_laser/tank_light_laser_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/orbital/ion_defense/ion_defense_tool_antidrop.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/sea/battleship/battleship_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/sea/destroyer/destroyer_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/sea/fabrication_barge/fabrication_barge.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/sea/frigate/frigate_ammo_shell.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/sea/hover_ship/hover_ship_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/sea/hover_ship/hover_ship_ammo_side.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/sea/missile_ship/missile_ship_tool_antidrop.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/sea/nuclear_sub/nuclear_sub_ammo.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/sea/nuclear_sub/nuclear_sub_ammo_missile.json` | MLA/TITANS | Исходник |
| Legion | `pa/units/sea/sea_scout/sea_scout_ammo.json` | MLA/TITANS | Исходник |
| Exiles | `pa/ammo/torpedo/torpedo.json` | MLA/TITANS | Исходник |
| Exiles | `pa/units/air/base_flyer/base_flyer.json` | MLA/TITANS | Исходник |
| Exiles | `pa/units/air/bomber/bomber_ammo.json` | MLA/TITANS | Отдельная копия: `pa/ammo/exiles_compat/bomber/bomber_ammo.json` |
| Exiles | `pa/units/air/bomber_heavy/bomber_heavy_ammo.json` | MLA/TITANS | Отдельная копия: `pa/ammo/exiles_compat/bomber_heavy/bomber_heavy_ammo.json` |
| Exiles | `pa/units/land/anti_nuke_launcher/anti_nuke_launcher_tool_weapon.json` | MLA/TITANS | Объединён |
| Exiles | `pa/units/land/artillery_long/artillery_long_ammo.json` | MLA/TITANS | Отдельная копия: `pa/ammo/exiles_compat/artillery_long/artillery_long_ammo.json` |
| Exiles | `pa/units/land/artillery_short/artillery_short_ammo.json` | MLA/TITANS | Отдельная копия: `pa/ammo/exiles_compat/artillery_short/artillery_short_ammo.json` |
| Exiles | `pa/units/land/base_bot/base_bot.json` | MLA/TITANS | Исходник |
| Exiles | `pa/units/land/base_structure/base_structure.json` | MLA/TITANS | Исходник |
| Exiles | `pa/units/land/base_vehicle/base_vehicle.json` | MLA/TITANS | Исходник |
| Exiles | `pa/units/land/tank_heavy_mortar/tank_heavy_mortar_ammo.json` | MLA/TITANS | Отдельная копия: `pa/ammo/exiles_compat/tank_heavy_mortar/tank_heavy_mortar_ammo.json` |
| Exiles | `pa/units/land/titan_vehicle/titan_vehicle_ammo_main.json` | MLA/TITANS | Исходник |
| Bugs | `pa/units/land/l_scout_bot/l_scout_bot.json` | Legion | Исходник (Bugs, 200) |
| Second Wave | `pa/units/land/air_defense/air_defense.json` | MLA/TITANS | Исходник |
| Second Wave | `pa/units/land/air_defense_adv/air_defense_adv.json` | MLA/TITANS | Исходник |
| Second Wave | `pa/units/land/bot_sniper/bot_sniper_beam_tool_weapon.json` | MLA/TITANS | Объединён |
| Second Wave | `pa/units/land/l_shield_gen/anti_entity_targets.json` | Legion | Объединён |
