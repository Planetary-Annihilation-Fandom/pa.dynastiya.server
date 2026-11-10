# Публикация под идентификаторами Biomes Lite

«Династия» выходит к игрокам под уже одобренными id `com.pa.biomes.lite.server` и `com.pa.biomes.lite.client`: новый id потребовал бы повторной модерации. Игра раз в день, около 13:00 МСК, скачивает эти моды из `main` публичных репозиториев [com.pa.biomes.lite.server](https://github.com/Planetary-Annihilation-Fandom/com.pa.biomes.lite.server) и [com.pa.biomes.lite.client](https://github.com/Planetary-Annihilation-Fandom/com.pa.biomes.lite.client). До этого времени новую версию можно проверить только локально.

Разработка идёт только в репозиториях «Династии». Репозитории биомов служат точкой публикации: веток в них нет, изменения приходят только скриптом. Публикуй только по команде пользователя «опубликуй».

## Перенос

Из корня серверного репозитория:

```powershell
node tools/publish-biomes.cjs
```

Скрипт берёт `origin/main` обоих репозиториев «Династии», клонирует при необходимости репозитории биомов в `../publish/` (рядом с `server/` и `client/`) и заменяет их содержимое целиком. Затем он вносит коррекции:

- в `modinfo.json` заменяет `identifier`, id в `companions`, `dependencies` и `conflicts`, убирает `hidden`;
- убирает оба id Biomes Lite из `ui/mods/dynastiya.mod_conflicts/conflicts.js`, иначе «Династия» найдёт конфликт сама с собой;
- останавливается, если id «Династии» остались в `modinfo.json`, `ui/` или `pa/`.

Результат коммитится в локальный `main` биомов. Скрипт не пушит и не ставит теги. Он откажется работать, если в клоне есть незакоммиченные или неотправленные изменения.

Каталоги `ui/mods/dynastiya.*` не переименовываются: игра загружает их по путям из `modinfo.json`, это подтверждено в игре при первой публикации.

## Проверка

1. Просмотри `git show --stat HEAD` и дифф `modinfo.json` в обоих клонах. Проверь `display_name`, `description`, `version`, `date` и `build`; версию изменённой части повышай в репозитории «Династии» до переноса.
2. Запусти тестовый профиль с опубликованными копиями из корня `pa`:

   ```powershell
   node mods/dynastiya/tools/resources/launch-test.cjs host --lobby --client mods/dynastiya/publish/com.pa.biomes.lite.client --server mods/dynastiya/publish/com.pa.biomes.lite.server
   ```

   Первый запуск со сменой id только включает моды; если проверка стилей упала по таймауту, закрой клиент и запусти ещё раз. В выводе должны быть `ids` биомов и `dynastiyaEnabled: true`.
3. В лобби должны быть раздел `LOBBY PLANET GENERATION` и серверный мод `Dynastiya Server`, без окна конфликтующих модов; кнопка `GENERATE PLANET` создаёт систему.

После проверки обычный запуск без `--client`/`--server` возвращает профиль к id «Династии».

## Теги и отправка

Опубликованный коммит отмечается тегом версии из `modinfo.json` соответствующей части:

```powershell
git -C ../publish/com.pa.biomes.lite.server tag v<версия сервера>
git -C ../publish/com.pa.biomes.lite.client tag v<версия клиента>
git -C ../publish/com.pa.biomes.lite.server push origin main --tags
git -C ../publish/com.pa.biomes.lite.client push origin main --tags
```

Если версия части не менялась, а содержимое изменилось, сначала повысь версию в репозитории «Династии»: тег с тем же именем уже указывает на прошлую публикацию.

## Откат

Последнее состояние оригинальных биомов отмечено тегом `v1.2.2-up0`. Чтобы вернуть прошлую публикацию, создай в `main` коммит с содержимым нужного тега и отправь его без переписывания истории:

```powershell
git -C ../publish/com.pa.biomes.lite.client restore --source v<версия> --staged --worktree -- .
git -C ../publish/com.pa.biomes.lite.client commit -m "Откат к v<версия>"
git -C ../publish/com.pa.biomes.lite.client push origin main
```

Откатывай обе части согласованно. Игроки получат откат при следующей ежедневной загрузке.
