## Descripcion del proyecto

Haremos una aplicacion de gestion de pedidos para vendedores de una empresa, estoy pensando en dividir el rol en 2, El admin que llevara el control del stock total que tengan en la empresa con la cantidad de productos y atraves de los productos vendidos muestre las ganancias totales y las ventas totales del producto en el apartado del administrador, esta luego el rol del vendedor, el cual podra ver su cantidad de productos vendidos, sus ventas totales y las comisiones totales, este podra hacer los pedidoos primero  agregando los datos del cliente los cuales tendran: Nombre e la empresa, RIF, direccion fiscal, fecha, nombre el contacto, orden de pedido y luego de agregarlo puede anadirle los productos y sus cantidades  y una ves anadidos, que pase a un apartado donde este muestre las descripciones del pedido, los productos cantidades, el moontoo total a pagar, etc y atraves de un boton pueda enviarse directamente al numero de la empresa con un mensaje pre-escrito el cual contenga toda la informacion del pedido, este pedido se tiene que almacenar en el historial de pedidos del vendor


## Stack Tecnologico
Frontend:
- Next.js
- Tailwind CSS

Backend:
- Supabase
- Postgresql (Base de datos)

## Reglas de negocio
- El stock se descuenta al confirmar el pedido (no antes).
- No se permite vender más cantidad de la que hay en stock disponible.
- Comisión: % fijo sobre el monto de venta, definido en el perfil del vendedor.
- Un pedido enviado no se puede editar, solo cancelar; al cancelarlo se devuelve el stock (Debe enviarse un mensaje al whatsapp el cual diga que el pedido fue cancelado).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
