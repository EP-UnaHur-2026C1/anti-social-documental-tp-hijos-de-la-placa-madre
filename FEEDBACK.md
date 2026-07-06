# Feedback del Trabajo Práctico (TP2 — MongoDB)

## Integrantes

A partir de los commits del repositorio:

- **Nicolás** (`Nicolas389`)
- **Nicolás Diorio** (`nico-diorio`)
- **Luca Nehuén** (`lucanehuen`)
- **Franco** (`Franco2912`)

> Trabajo repartido entre los integrantes del equipo. 👏

---

## Resumen General

¡Excelente trabajo! 🎉 Es una de las entregas más completas, y además **corrigieron el punto que había quedado pendiente en el TP1**: ahora la regla de los comentarios antiguos **sí se aplica** al visualizar los posts y es configurable. La arquitectura es muy madura (capas + **repositorios** + servicios + utils), el modelado documental es coherente (imágenes y tags embebidos, comentarios referenciados), y resolvieron **tres bonus** —caché con Redis, upload de imágenes a disco y seguidores— con mucho cuidado.

### Estado por criterio

| Criterio        | Estado | Comentario breve |
|-----------------|:------:|------------------|
| Arquitectura    |   ✅   | Capas + repositorios + utils; controladores de única responsabilidad. |
| Modelado        |   ✅   | Documental coherente; `nickName` único (ver matiz en Obs. 1). |
| Validaciones    |   ✅   | Joi + restricciones de Mongoose + validación de `ObjectId`. |
| Middlewares     |   ✅   | `validateExistsModel(Modelo, campo)` genérico; caché por claves. |
| API REST        |   ✅   | CRUD + relaciones (imágenes, tags, comentarios) completos. |
| Configuración   |   ✅   | `MONGO_URI`, `PORT`, `COMMENT_EXPIRATION_MONTHS` por `.env`; Docker. |
| Documentación   |   ✅   | Swagger (`docs/swagger.yaml`) + ejemplos. |

---

## Fortalezas

### 1. La regla de comentarios antiguos ahora se aplica y es configurable ⏳✅
**Ubicación:** `src/repositories/post.repository.js` (`obtenerTodos`, `obtenerPorId`)

Al traer los posts, adjuntan a cada uno solo los comentarios vigentes:

```js
post.Comments = await Comment.find({ idPost: post._id, createdAt: { $gte: fechaLimite } }).sort(...);
```

con `fechaLimite` calculada desde `COMMENT_EXPIRATION_MONTHS`. Se aplica en la visualización del post **y** en el endpoint de comentarios, y el umbral es configurable. Es justo lo que faltaba en el TP anterior: ¡muy bien resuelto! 🎯

### 2. Arquitectura con repositorios y utilidades reutilizables 🏗️
**Ubicación:** `src/repositories/`, `src/utils/`, `src/middlewares/asyncHandler.js`

Los controladores son delgados y delegan en repositorios; los `utils` (`findResourceOrFail`, `findInArrayOrFail`, `processAndSaveImage`, `deleteMultipleImages`) concentran lógica repetida, y `asyncHandler` centraliza el manejo de errores. Es exactamente la “única responsabilidad” que pide el enunciado.

### 3. Modelado documental coherente 🗃️
**Ubicación:** `src/db/models/Post.js`, `src/db/models/Comment.js`

Imágenes **embebidas** (subdocumentos con `_id`), tags como **array de strings** (idiomático en NoSQL), comentarios **referenciados** en su propia colección, y seguidores como arrays de referencias. `nickName` único. Buen criterio para decidir qué embeber y qué referenciar.

### 4. Validación de `ObjectId` y existencia en middlewares ♻️
**Ubicación:** `src/middlewares/genericMiddleware.js`

`validateExistsModel(Modelo, paramName)` valida formato de `ObjectId` **y** existencia para cualquier modelo, dejando el documento en `req.modelo`. Se compone en todas las rutas.

### 5. Tres bonus muy bien resueltos 🌟
- **Caché** (Redis) con claves específicas por recurso e invalidación documentada en `router.post.js`.
- **Upload** real: `processAndSaveImage` descarga/guarda en disco y `deleteMultipleImages` limpia al borrar.
- **Seguidores** (`followers`/`following` + `followMiddleware`).

---

## Observaciones

### 1. La colección `Tag` y los tags embebidos en el post no están vinculados

**Estado:** ⚠️  **Severidad:** 🟡 Mejora recomendada
**Ubicación:** `src/db/models/Post.js` (`tags: [String]`), `src/controllers/tag.controller.js`, `src/middlewares/genericMiddleware.js` (`validarTagByName`)

**Descripción:**
Existe un CRUD de `Tag` sobre una colección propia (incluso con paginación), pero los posts guardan sus tags como **strings embebidos**, y `validarTagByName` verifica la existencia consultando `Post.findOne({ tags })`, no la colección `Tag`. Es decir, crear un `Tag` en su colección no lo hace disponible para los posts, y agregar un tag a un post no toca la colección `Tag`.

**Impacto:**
Conviven dos nociones de “tag” que no se hablan entre sí, lo que puede confundir y deja la colección `Tag` algo desconectada del resto.

**Recomendación:**
Elegir un único modelo: o bien referenciar tags por `ObjectId` a la colección `Tag` (y popularlos), o bien resolver todo con strings embebidos y prescindir de la colección `Tag` separada.

---

### 2. Al crear un post no se verifica que el usuario referenciado exista

**Estado:** ⚠️  **Severidad:** 🟡 Mejora recomendada
**Ubicación:** `src/controllers/post.controllers.js` (`postNewPost`)

**Descripción:**
`postNewPost` crea el post directamente con `req.body`; el schema de Joi valida el formato, pero no se comprueba que el `idUser` corresponda a un usuario existente (a diferencia de otras rutas, que sí usan `validateExistsModel`).

**Impacto:**
Permitiría crear un post “huérfano” con un `idUser` que no existe.

**Recomendación:**
Sumar una verificación de existencia del usuario (con el mismo middleware genérico que ya tienen) antes de crear el post.

---

## Conclusión

Es una entrega de muy alto nivel, y se nota la evolución respecto del TP anterior: la regla de negocio quedó **bien conectada y configurable**, sobre una arquitectura con repositorios, utilidades reutilizables, tres bonus sólidos y buena documentación. 🌟

Los ajustes son menores (unificar el modelo de tags y validar el usuario al crear el post). ¡Felicitaciones por el trabajo y por corregir lo del TP1! 🚀
