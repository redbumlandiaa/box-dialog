# boxDialog

Sistema de diálogos modales en **vanilla JavaScript** con iconos SVG. Sin dependencias, basado en Promesas, accesible y personalizable.

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![No dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)
![Vanilla JS](https://img.shields.io/badge/JS-vanilla-yellow.svg)

**Repositorio:** [github.com/redbumlandiaa/box-dialog](https://github.com/redbumlandiaa/box-dialog)

## Características

- 🚀 **Vanilla JS** — sin jQuery ni dependencias
- 🎨 **Iconos SVG inline** — sin peticiones HTTP extra, heredan el color con `currentColor`
- 🤝 **API basada en Promesas** — usa `async/await`
- ♿ **Accesible** — `aria-modal`, focus trap, cierre con `Esc`, navegación por teclado
- 🎯 **5 tipos de diálogos** — `alert`, `success`, `confirm`, `prompt`, `toast`
- 🎨 **Personalizable** — colores, iconos, anchos, header con gradiente o color sólido
- 📱 **Responsive** — se adapta a pantallas pequeñas
- ⌨️ **Atajos de teclado** — `Esc`, `Tab`, `←/→`, `Enter`

## Instalación

Copia los archivos `box-dialog.js` y `box-dialog.css` a tu proyecto e inclúyelos en tu página:

```html
<link rel="stylesheet" href="path/to/box-dialog.css">
<script src="path/to/box-dialog.js"></script>
```

Sin build step, sin npm, sin nada más.

## Demo

Abre [`index.html`](./index.html) en tu navegador. Tiene dos pestañas:
- **Ejemplos** — botones interactivos con cada tipo de diálogo
- **Documentación** — la misma referencia que este README pero navegable

## Uso rápido

```js
// Alerta roja
await boxDialog.alert({ message: 'No se puede continuar.' });

// Éxito verde
await boxDialog.success({ message: 'Datos guardados correctamente.' });

// Confirmación azul — la Promise resuelve con { action }
const { action } = await boxDialog.confirm({ message: '¿Continuar?' });
if (action === 'yes') {
  // el usuario eligió "Sí"
}

// Prompt con input — la Promise incluye { value }
const { value } = await boxDialog.prompt({ title: 'Tu nombre' });
console.log('Hola', value);

// Toast no bloqueante (se cierra solo)
await boxDialog.toast({ message: 'Hola!', type: 'success' });
```

## API

Todos los métodos (excepto `closeAll`) devuelven una `Promise` que se resuelve con `{ action, value? }`.

### `boxDialog.alert(options)`

Diálogo de error en **rojo**. Pensado para notificar al usuario sobre algo que salió mal.

```js
const result = await boxDialog.alert({
  title: 'Error de conexión',
  message: 'No se pudo guardar el archivo.',
});
// result.action: 'ok' | 'escape' | 'close' | 'backdrop'
```

### `boxDialog.success(options)`

Diálogo de éxito en **verde**. Confirmación de que una operación se completó.

```js
await boxDialog.success({
  title: '¡Listo!',
  message: 'Cambios guardados correctamente.',
});
```

### `boxDialog.confirm(options)`

Diálogo de confirmación en **azul**. Ideal para pedir confirmación antes de una acción destructiva.

```js
const { action } = await boxDialog.confirm({
  title: 'Eliminar usuario',
  message: '¿Estás seguro? Esta acción no se puede deshacer.',
  buttons: [
    { text: 'Cancelar', value: 'cancel' },
    { text: 'Eliminar', value: 'delete', primary: true },
  ],
});

if (action === 'delete') {
  // ejecutar eliminación
}
```

### `boxDialog.prompt(options)`

Diálogo con **campo de texto**. La Promise incluye `value` con el contenido del input.

```js
const { action, value } = await boxDialog.prompt({
  title: 'Tu nombre',
  message: '¿Cómo te llamas?',
  inputPlaceholder: 'Ej. Ana',
  inputValue: '',         // valor inicial
  multiLine: false,       // true => textarea
  rows: 4,                // filas del textarea
});

if (action === 'ok') {
  console.log('Hola', value);
}
```

### `boxDialog.show(options)`

Diálogo **genérico** con control total. Es la base sobre la que se construyen los demás.

```js
await boxDialog.show({
  title: 'Guardar cambios',
  message: 'Si sales ahora perderás los cambios.',
  color: '#0891b2',
  icon: 'info',            // alert | success | confirm | info | error
  width: 480,              // px
  gradient: true,          // false => color sólido
  closeOnBackdrop: true,   // cerrar al hacer click fuera
  closeOnEsc: true,
  showClose: true,         // mostrar la X
  buttons: [
    { text: 'Cancelar', value: 'cancel' },
    { text: 'Guardar',  value: 'save', primary: true },
  ],
});
```

`message` acepta HTML — útil para enlaces, listas o contenido enriquecido:

```js
await boxDialog.show({
  title: 'Términos',
  message: `<p>Al continuar aceptas nuestros <a href="#">términos</a>.</p>`,
});
```

### `boxDialog.toast(options)`

Notificación **no bloqueante** que se cierra sola. Ideal para feedback rápido.

```js
await boxDialog.toast({
  message: 'Guardado',
  type: 'success',                                  // success | error | info | confirm
  position: 'top-right',                            // top-left | top-center | top-right | bottom-*
  duration: 3000,                                   // ms antes de cerrarse
});
```

### `boxDialog.closeAll()`

Cierra todos los diálogos abiertos. Útil en logout, reset de estado, navegación, etc.

```js
boxDialog.closeAll();
```

## Referencia de opciones

| Opción | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | `string` | `'Estado'` | Título del diálogo |
| `message` | `string \| HTML` | `''` | Contenido del cuerpo |
| `color` | `string` (hex) | `#1ab849` | Color del borde, header y botón primario |
| `icon` | `string` | `null` | `alert`, `success`, `confirm`, `info`, `error` |
| `width` | `number` | `380` | Ancho máximo en píxeles |
| `gradient` | `boolean` | `true` | Header con gradiente (`true`) o color sólido (`false`) |
| `closeOnBackdrop` | `boolean` | `true` | Cierra al hacer click fuera del diálogo |
| `closeOnEsc` | `boolean` | `true` | Cierra con la tecla `Esc` |
| `showClose` | `boolean` | `true` | Muestra el botón X en el header |
| `input` | `boolean` | `false` | `true` => muestra input (lo activa `prompt` automáticamente) |
| `multiLine` | `boolean` | `false` | `input` (`false`) o `textarea` (`true`) |
| `rows` | `number` | `4` | Filas del `textarea` |
| `inputPlaceholder` | `string` | `''` | Placeholder del input |
| `inputValue` | `string` | `''` | Valor inicial del input |
| `focusOnInput` | `boolean` | `false` | Foco inicial en el input |
| `buttons` | `array` | `[{ text: 'Ok' }]` | Array de `{ text, value, primary? }` |

## Resolución de la Promise

Cada diálogo (excepto `toast`) resuelve con esta forma:

```js
{
  action: 'ok',         // o 'yes', 'no', 'cancel', 'save'... según el value del botón
  value: 'texto',       // solo en prompt: el contenido del input
}
```

Valores posibles de `action`:

- `'ok' / 'yes' / 'no' / 'save' / 'delete' / ...` — el `value` del botón presionado
- `'escape'` — el usuario presionó `Esc`
- `'close'` — el usuario hizo click en la X
- `'backdrop'` — el usuario hizo click fuera del diálogo

## Atajos de teclado

| Tecla | Acción |
|---|---|
| `Esc` | Cerrar el diálogo |
| `Tab` o `→` | Siguiente botón (cicla) |
| `←` | Botón anterior (cicla) |
| `Enter` | Activar el botón enfocado |

## Theming con variables CSS

Puedes sobreescribir las variables CSS para personalizar el aspecto sin tocar el archivo del plugin:

```css
:root {
  --bd-radius: 12px;
  --bd-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  --bd-z: 9999;
  --bd-anim: 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

El color de cada diálogo se controla por instancia con la opción `color` (se aplica como variable `--bd-color` al elemento del diálogo).

## Accesibilidad

- `role="alertdialog"` y `aria-modal="true"` en el contenedor
- Focus trap dentro del diálogo
- Cierre con `Esc`
- `aria-label` en el botón de cerrar
- Texto no seleccionable (`user-select: none`)

## Compatibilidad

boxDialog funciona en todos los navegadores modernos:

- Chrome / Edge 90+
- Firefox 90+
- Safari 14+
- Opera 76+

Usa `color-mix()` y CSS custom properties, por lo tanto no es compatible con IE11. Si necesitas soporte para navegadores antiguos, considera usar un polyfill o una versión transpilada (Babel + PostCSS).

## Estructura del proyecto

```
box-dialog/
├── box-dialog.js     # el plugin
├── box-dialog.css    # estilos
├── index.html        # demo con ejemplos + documentación
├── README.md         # este archivo
└── LICENSE           # MIT
```

## Créditos

Plugin modernizado a partir del original `jQueryBoxDialog3` de **Jonatan Pereira Pacheco**.

## Licencia

[MIT](./LICENSE) © 2026 Jonatan Pereira Pacheco
