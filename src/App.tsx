import { Suspense, defineComponent, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import Home from "@/pages/Home/Page";
import useFacebook from "./hooks/useFacebook.ts";
import styles from "./css/modules/core.module.scss";
import useAlertDialog from "@/hooks/useAlertDialog.ts";

const Root = defineComponent({
    async setup() {
        const fb = useFacebook();
        const dialog = useAlertDialog();

        await fb.loadCookies().then(() => {
            // reload the extension page every time the fb account changes
            watch(fb.id, () => {
                window.location.reload();
            });

            // refresh the cookie every time the cookie changes
            chrome.cookies.onChanged.addListener(useDebounceFn(() => {
                fb.loadCookies();
            }, 500));
        });

        if (!fb.isLogin.value) {
            dialog.alert("You are not logged in to Facebook. please log in first.").then(() => {
                chrome.tabs.getCurrent((tab) => {
                    chrome.tabs.create({url: "https://www.facebook.com/", active: true, index: 0}, () => {
                        chrome.tabs.remove(Number(tab?.id || 0));
                    });
                })
            });

            return () => null
        }

        await fb.loadMetaData();

        if (!fb.metaData.value.account) {
            dialog.alert("Tidak dapat memuat meta data.").then(() => window.location.reload());
            return () => null
        } else {
            return () => (
                <Home />
            )
        }
    }
});

const Loading = defineComponent({
    setup() {
        return () => (
            <div class={styles.spinner_container}>
                <div class={styles.spinner}>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        )
    }
})

const App = defineComponent({
    setup() {
        return () => (
            <Suspense>
                {{
                    default: () => <Root />,
                    fallback: () => <Loading />
                }}
            </Suspense>
        )
    }
});

export default App;
