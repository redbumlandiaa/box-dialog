/**
 * boxDialog - Sistema de diálogos modales en vanilla JS
 * Versión: 1.0.0
 * Licencia: MIT
 * Autor: Jonatan Pereira Pacheco
 * Repositorio: https://github.com/redbumlandiaa/box-dialog
 *
 * API:
 *   boxDialog.show(options)   -> Promise<{ action, value }>
 *   boxDialog.alert(options)  -> Promise<{ action }>
 *   boxDialog.success(options)-> Promise<{ action }>
 *   boxDialog.confirm(options)-> Promise<{ action }>
 *   boxDialog.prompt(options) -> Promise<{ action, value }>
 *   boxDialog.toast(options)  -> Promise<void>
 *   boxDialog.closeAll()      -> void
 */
(function (global) {
  'use strict';

  const ICONS = {
    close:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    alert:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    success:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    confirm:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    info:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    error:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
  };

  const COLORS = {
    default: '#1ab849',
    alert: '#db0d0d',
    success: '#1ab849',
    confirm: '#230de3',
    info: '#0891b2',
  };

  const openDialogs = [];

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'class') node.className = value;
      else if (key === 'style' && typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) {
          if (k.startsWith('--')) node.style.setProperty(k, v);
          else node.style[k] = v;
        }
      } else if (key.startsWith('on') && typeof value === 'function')
        node.addEventListener(key.slice(2).toLowerCase(), value);
      else if (key === 'html') node.innerHTML = value;
      else if (value !== null && value !== undefined && value !== false)
        node.setAttribute(key, value);
    }
    for (const child of [].concat(children)) {
      if (child == null) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return node;
  }

  function buildDialog(options) {
    const op = Object.assign(
      {
        title: 'Estado',
        message: '',
        icon: null,
        color: COLORS.default,
        width: 380,
        closeOnBackdrop: true,
        closeOnEsc: true,
        showClose: true,
        multiLine: false,
        rows: 4,
        inputPlaceholder: '',
        inputValue: '',
        input: false,
        buttons: [{ text: 'Ok', value: 'ok', primary: true }],
        gradient: true,
      },
      options
    );

    return new Promise((resolve) => {
      let resolved = false;
      const finish = (action, value) => {
        if (resolved) return;
        resolved = true;
        const top = openDialogs[openDialogs.length - 1];
        if (top && top.dialog === dialog) openDialogs.pop();
        if (top && openDialogs.length === 0) {
          document.removeEventListener('keydown', onKeydown, true);
          document.body.classList.remove('bd-no-scroll');
        } else if (top) {
          top.input && top.input.focus();
        }
        backdrop.classList.remove('bd-show');
        dialog.classList.remove('bd-show');
        setTimeout(() => {
          backdrop.remove();
          if (openDialogs.length === 0) document.body.classList.remove('bd-no-scroll');
        }, 200);
        resolve({ action, value });
      };

      const backdrop = el('div', { class: 'bd-backdrop' });
      const dialog = el('div', {
        class: 'bd-dialog',
        role: 'alertdialog',
        'aria-modal': 'true',
        'aria-labelledby': 'bd-title-' + Date.now(),
        style: { '--bd-color': op.color, maxWidth: op.width + 'px' },
      });

      const titleId = dialog.getAttribute('aria-labelledby');

      const header = el(
        'div',
        { class: 'bd-header' + (op.gradient ? '' : ' bd-header-solid') },
        op.icon ? el('div', { class: 'bd-icon', html: ICONS[op.icon] || '' }) : null
      );
      header.appendChild(
        el('div', { class: 'bd-title', id: titleId }, [
          el('span', { class: 'bd-title-text' }, op.title),
          op.showClose
            ? el(
                'button',
                {
                  class: 'bd-close',
                  type: 'button',
                  title: 'Cerrar',
                  'aria-label': 'Cerrar',
                  html: ICONS.close,
                  onclick: () => finish('close'),
                },
                []
              )
            : null,
        ])
      );

      const body = el('div', { class: 'bd-body' });
      if (typeof op.message === 'string') body.innerHTML = op.message;

      let inputEl = null;
      if (op.input) {
        inputEl = op.multiLine
          ? el('textarea', {
              class: 'bd-input',
              rows: op.rows,
              placeholder: op.inputPlaceholder || '',
            })
          : el('input', {
              class: 'bd-input',
              type: 'text',
              placeholder: op.inputPlaceholder || '',
              value: op.inputValue || '',
            });
        const wrapper = el('div', { class: 'bd-input-wrap' }, inputEl);
        body.appendChild(wrapper);
      }

      const footer = el('div', { class: 'bd-footer' });
      op.buttons.forEach((btn) => {
        const b = el(
          'button',
          {
            class: 'bd-btn' + (btn.primary ? ' bd-btn-primary' : ''),
            type: 'button',
            onclick: () => {
              const value = inputEl ? inputEl.value : undefined;
              finish(btn.value || btn.text, value);
            },
          },
          btn.text
        );
        footer.appendChild(b);
      });

      dialog.appendChild(header);
      dialog.appendChild(body);
      dialog.appendChild(footer);
      backdrop.appendChild(dialog);

      backdrop.addEventListener('mousedown', (e) => {
        if (e.target === backdrop && op.closeOnBackdrop) finish('backdrop');
      });

      const getFocusables = () => {
        const list = [];
        if (op.showClose) {
          const c = dialog.querySelector('.bd-close');
          if (c) list.push(c);
        }
        if (inputEl) list.push(inputEl);
        dialog.querySelectorAll('.bd-btn').forEach((b) => list.push(b));
        return list;
      };

      const onKeydown = (e) => {
        const key = e.key;

        if (key === 'Escape' && op.closeOnEsc) {
          e.preventDefault();
          e.stopPropagation();
          finish('escape');
          return;
        }

        if (key === 'Enter') {
          const active = document.activeElement;
          if (active && active.classList && active.classList.contains('bd-btn')) {
            e.preventDefault();
            active.click();
            return;
          }
          if (inputEl && op.buttons.length === 1) {
            e.preventDefault();
            finish(op.buttons[0].value || op.buttons[0].text, inputEl.value);
            return;
          }
        }

        if (key === 'Tab' || key === 'ArrowRight' || key === 'ArrowLeft') {
          const focusables = getFocusables();
          if (focusables.length === 0) return;
          e.preventDefault();
          const current = focusables.indexOf(document.activeElement);
          let next;
          if (key === 'ArrowLeft') {
            next = current <= 0 ? focusables.length - 1 : current - 1;
          } else {
            next = current === -1 ? 0 : (current + 1) % focusables.length;
          }
          focusables[next].focus();
        }
      };
      document.addEventListener('keydown', onKeydown, true);

      document.body.appendChild(backdrop);
      document.body.classList.add('bd-no-scroll');
      openDialogs.push({ dialog, input: inputEl });

      requestAnimationFrame(() => {
        backdrop.classList.add('bd-show');
        dialog.classList.add('bd-show');
        let focusTarget;
        if ((inputEl && op.focusOnInput) || (inputEl && op.buttons.length === 0)) {
          focusTarget = inputEl;
        } else {
          focusTarget =
            dialog.querySelector('.bd-btn-primary') ||
            dialog.querySelector('.bd-btn') ||
            dialog.querySelector('.bd-close') ||
            dialog;
        }
        focusTarget && focusTarget.focus();
      });
    });
  }

  const boxDialog = {
    show: (options) => buildDialog(options),
    alert: (options = {}) =>
      buildDialog(
        Object.assign(
          {
            title: 'Alerta',
            message: 'No se puede continuar.',
            icon: 'alert',
            color: COLORS.alert,
            buttons: [{ text: 'Aceptar', value: 'ok', primary: true }],
          },
          options
        )
      ),
    success: (options = {}) =>
      buildDialog(
        Object.assign(
          {
            title: 'Éxito',
            message: 'Datos guardados correctamente.',
            icon: 'success',
            color: COLORS.success,
            buttons: [{ text: 'Aceptar', value: 'ok', primary: true }],
          },
          options
        )
      ),
    confirm: (options = {}) =>
      buildDialog(
        Object.assign(
          {
            title: 'Confirmar',
            message: '¿Seguro que desea continuar?',
            icon: 'confirm',
            color: COLORS.confirm,
            buttons: [
              { text: 'No', value: 'no' },
              { text: 'Sí', value: 'yes', primary: true },
            ],
          },
          options
        )
      ),
    prompt: (options = {}) =>
      buildDialog(
        Object.assign(
          {
            title: 'Ingrese un valor',
            message: '',
            icon: 'info',
            color: COLORS.info,
            input: true,
            multiLine: false,
            focusOnInput: true,
            buttons: [
              { text: 'Cancelar', value: 'cancel' },
              { text: 'Aceptar', value: 'ok', primary: true },
            ],
          },
          options
        )
      ),
    toast: (options = {}) => {
      const op = Object.assign(
        {
          message: '',
          type: 'info',
          duration: 3000,
          position: 'top-right',
        },
        options
      );

      return new Promise((resolve) => {
        const container = getOrCreateToastContainer(op.position);
        const toast = el('div', { class: 'bd-toast bd-toast-' + op.type, role: 'status' }, [
          el('div', { class: 'bd-toast-icon', html: ICONS[op.type] || ICONS.info }),
          el('div', { class: 'bd-toast-msg' }, typeof op.message === 'string' ? op.message : ''),
          el(
            'button',
            {
              class: 'bd-toast-close',
              type: 'button',
              'aria-label': 'Cerrar',
              html: ICONS.close,
              onclick: () => close(),
            },
            []
          ),
        ]);
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('bd-show'));
        const timer = setTimeout(close, op.duration);

        function close() {
          clearTimeout(timer);
          toast.classList.remove('bd-show');
          toast.classList.add('bd-hide');
          toast.addEventListener('transitionend', () => toast.remove(), { once: true });
          resolve();
        }
      });
    },
    closeAll: () => {
      document.querySelectorAll('.bd-backdrop').forEach((b) => b.remove());
      document.body.classList.remove('bd-no-scroll');
      openDialogs.length = 0;
    },
  };

  function getOrCreateToastContainer(position) {
    let c = document.querySelector('.bd-toast-container[data-pos="' + position + '"]');
    if (c) return c;
    c = el('div', { class: 'bd-toast-container', 'data-pos': position });
    document.body.appendChild(c);
    return c;
  }

  global.boxDialog = boxDialog;
})(typeof window !== 'undefined' ? window : globalThis);
