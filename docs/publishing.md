# Публикация «Династии»

Мод публикуется из `main` собственных публичных репозиториев:

| Часть | Репозиторий | Идентификатор |
|---|---|---|
| Сервер | [pa.dynastiya.server](https://github.com/Planetary-Annihilation-Fandom/pa.dynastiya.server) | `com.pa.dynastiya.server` |
| Клиент | [pa.dynastiya.client](https://github.com/Planetary-Annihilation-Fandom/pa.dynastiya.client) | `com.pa.dynastiya.client` |

Biomes Lite больше не используется как точка публикации. Не переноси туда изменения и не подменяй идентификаторы «Династии». Старые клоны в `../publish/` не участвуют в выпуске; скрипт `tools/publish-biomes.cjs` удалён. Выпускай новую версию только по команде пользователя «опубликуй».

## Первое добавление в Community Mods

Собственные идентификаторы требуют отдельного добавления в каталог: прежнее одобрение Biomes Lite на них не переносится. По [инструкции автора шаблона модов](https://github.com/Quitch/New-GW-Cards/blob/main/docs/releasing.md), отправь ссылки на оба репозитория в канал `#new-mod-submissions` официального Discord PA и дождись добавления в Community Mods. Если моды уже добавлены под собственными ID, повторная заявка не нужна.

Источники ZIP для каталога:

- Сервер: `https://github.com/Planetary-Annihilation-Fandom/pa.dynastiya.server/archive/refs/heads/main.zip`.
- Клиент: `https://github.com/Planetary-Annihilation-Fandom/pa.dynastiya.client/archive/refs/heads/main.zip`.

В `modinfo.json` сохраняй собственные `identifier` и `github`, а в серверном `companions` указывай `com.pa.dynastiya.client`. Клиентский `hidden: true` оставляет вспомогательную часть скрытой из общего списка; её подключает серверный мод через `companions`.

Обе части используют [общие Discussions](https://github.com/Planetary-Annihilation-Fandom/pa.dynastiya.server/discussions) в поле `forum` и [GIF-аватар](https://raw.githubusercontent.com/Planetary-Annihilation-Fandom/pa.dynastiya.server/main/assets/avatar.gif) в поле `icon`. Файл аватара лежит в `assets/avatar.gif` серверного репозитория; сначала отправляй его на GitHub и проверяй raw-ссылку, затем обновляй манифесты.

## Подготовка и проверка выпуска

1. Влей готовые изменения в `main` соответствующих репозиториев. В релизном коммите повысь `version` каждой изменённой части по правилам `AGENTS.md` и обнови `date`; версии клиента и сервера независимы. Проверь `display_name`, `description`, `build`, ссылки и согласованность `companions`.
2. Из корня `pa` запусти тестовый профиль с обычными исходниками «Династии»:

   ```powershell
   node mods/dynastiya/tools/resources/launch-test.cjs host --lobby
   ```

   В выводе должны быть собственные ID «Династии» и `dynastiyaEnabled: true`. Проверь загрузку обеих частей, отсутствие окна конфликтов и создание системы кнопкой `GENERATE PLANET` в разделе `LOBBY PLANET GENERATION`.
3. Просмотри итоговый коммит и убедись, что номер версии ещё не занят тегом. Отметь выпуск тегом версии соответствующей части и отправь `main` с этим тегом. Пример из корня `pa`:

   ```powershell
   git -C mods/dynastiya/server tag v<версия-сервера>
   git -C mods/dynastiya/server push origin main refs/tags/v<версия-сервера>
   git -C mods/dynastiya/client tag v<версия-клиента>
   git -C mods/dynastiya/client push origin main refs/tags/v<версия-клиента>
   ```

   Для неизменённой части новый тег не создавай. Отправка в `main` меняет ZIP, который забирает каталог; тег фиксирует проверенный выпуск.
4. После обновления каталога проверь в Community Mods собственные ID, версии, аватар и ссылку на Discussions. Push на GitHub сам по себе не подтверждает обновление каталога; точное время индексации заранее не гарантируется.

Игрокам со старой установкой под ID Biomes Lite нужно отключить обе старые части и установить серверную «Династию» из каталога. Это другие идентификаторы, поэтому обычное обновление Biomes Lite не переключит установку на новый мод. Biomes Lite остаются в списке конфликтов «Династии».

## Откат

Откатывай изменения отдельным коммитом в собственном репозитории без переписывания истории. Для уже опубликованной версии используй `git revert` нужных коммитов, затем повысь версию и дату и проведи обычный выпуск с новым тегом: старый тег не перемещай. Если изменения затрагивали совместимость клиента и сервера, откатывай обе части согласованно. Проверь получение исправленного выпуска через Community Mods.
