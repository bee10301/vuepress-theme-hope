import { usePageFrontmatter } from "@vuepress/client";
import { type VNode, computed, defineComponent, h, nextTick, ref } from "vue";

import { useThemeLocaleData } from "@theme-hope/composables/index";

import { LockIcon } from "./icons.js";

import "../styles/password-modal.scss";

export default defineComponent({
  name: "PasswordModal",

  props: {
    /**
     * Whether is fullscreen
     *
     * 是否是全屏
     */
    full: Boolean,
  },

  emits: ["verify"],

  setup(props, { emit }) {
    const frontmatter = usePageFrontmatter();
    const themeLocale = useThemeLocaleData();
    const password = ref("");
    const hasTried = ref(false);
    const remember = ref(false);

    const locale = computed(() => themeLocale.value.encryptLocales);

    let hintHandler: number | null = null;

    const verify = (): void => {
      // clear previous handler
      if (hintHandler) clearTimeout(hintHandler);
      hasTried.value = false;

      emit("verify", password.value, remember.value);

      void nextTick().then(() => {
        hasTried.value = true;

        hintHandler = setTimeout(() => {
          hasTried.value = false;
        }, 1000) as unknown as number;
      });
    };

    return (): VNode =>
      h(
        "div",
        {
          class: [
            "vp-decrypt-layer",
            { expand: props.full || frontmatter.value["home"] },
          ],
        },
        h("div", { class: "vp-decrypt-modal" }, [
          h(
            "div",
            { class: ["vp-decrypt-hint", { tried: hasTried.value }] },
            hasTried.value
              ? locale.value.errorHint
              : h(LockIcon, { "aria-label": locale.value.iconLabel })
          ),
          h("div", { class: "vp-decrypt-input" }, [
            h("input", {
              type: "password",
              value: password.value,
              placeholder: locale.value.placeholder,
              onInput: ({ target }: InputEvent) => {
                password.value = (<HTMLInputElement>target).value;
              },
              onKeydown: ({ key }: KeyboardEvent) => {
                if (key === "Enter") verify();
              },
            }),
          ]),
          h("div", { class: "vp-remember-password" }, [
            h("input", {
              type: "checkbox",
              value: remember.value,
              onChange: () => (remember.value = !remember.value),
            }),
            locale.value.remember,
          ]),
          h(
            "button",
            {
              type: "button",
              class: "vp-decrypt-submit",
              onClick: () => verify(),
            },
            "OK"
          ),
        ])
      );
  },
});
