import { defineComponent } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import styles from "@/css/modules/core.module.scss";

export default defineComponent({
    setup() {
        function donate() {
            chrome.tabs.create({url: "https://trakteer.id/Mr_VenomYT?open=true", active: true, index: 0});
        }

        return () => (
            <div class={[styles.card, styles.mt_3, styles.mb_3]}>
                <div class={styles.card_body}>
                    <div class={styles.row}>
                        <div class={[styles.col_8]}>
                            <div class={[styles.d_flex, styles.justify_center]}>
                                <div class={styles.d_flex}>
                                    <a href="https://discord.gg/XdaE8RZYng" target="_blank" class={styles.icon_link}>
                                        <FontAwesomeIcon icon={["fab", "discord"]} size="3x" />
                                    </a>
                                    <a href="https://www.patreon.com/Iamhasil0786/" target="_blank" class={styles.icon_link}>
                                        <FontAwesomeIcon icon={["fab", "patreon"]} size="3x" />
                                    </a>
                                    <a href="https://instagram.com/muhammad_hasil_13" target="_blank" class={styles.icon_link}>
                                        <FontAwesomeIcon icon={["fab", "instagram"]} size="3x" />
                                    </a>
                                </div>
                            </div>
                            <div>
                                <p>
                                    Donate to help me buy coffee so I can be enthusiastic about creating. Thank You
                                </p>
                            </div>
                            <button class={styles.button} onClick={donate}>
                                Donate Now
                            </button>
                        </div>
                        <div class={[styles.col_4, styles.d_flex, styles.align_items_center]}>
                            <img class={styles.img_responsive} src="/assets/img/donate.png" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})
