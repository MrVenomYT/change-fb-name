import { defineComponent } from "vue";
import styles from "@/css/modules/core.module.scss";
import useFacebook from "@/hooks/useFacebook";

export default defineComponent({
    setup() {
        const fb = useFacebook();

        return () => {
            if (!fb.metaData.value.canChangeName) {
                const changeNameUrl = `https://accountscenter.facebook.com/profiles/${fb.id.value}/name`;
                return (
                    <div class={[styles.card, styles.mb_4]}>
                        <div class={styles.card_title}>
                            <h3 class={styles.text_center}>Tips</h3>
                        </div>
                        <div class={styles.card_body}>
                            <p>Make sure the name you want to change is valid because not all characters are accepted by Facebook</p>
                             <p>How to find out: </p>
                            <ul>
                               <li>Go to the change name page <a href={changeNameUrl} target="_blank">{changeNameUrl}</a></li>
                                 <li>Fill in <b>first name</b>, <b>middle name</b>, and <b>last name</b> with the name you want</li>
                                 <li>Then click <b>Change</b>. If there is no error information or changes to the <b>View Name</b> page, it means the character you are using is valid. just go straight back, don't click <b>Done</b></li>
                            </ul>
                        </div>
                    </div>
                )
            }
        }
    }
})
