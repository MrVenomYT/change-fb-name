import { defineComponent, ref, computed } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { v4 as uuidv4 } from "uuid";
import styles from "@/css/modules/core.module.scss";
import useAxios from "@/hooks/useAxios";
import useAlertDialog from "@/hooks/useAlertDialog";
import useFacebook from "@/hooks/useFacebook";

export default defineComponent({
    setup() {
        const firstname = ref<string>("");
        const midname = ref<string>("");
        const lastname = ref<string>("");
        const isLoading = ref<boolean>(false);
        const withoutLimit = ref<boolean>(false);

        const fb = useFacebook();
        const http = useAxios();
        const dialog = useAlertDialog();
        const v$ = useVuelidate({firstname: { required }}, { firstname });

        console.log(fb.metaData.value)

        const fullname = computed<string>(() => {
            // return [firstname.value, midname.value, lastname.value]
            //     .filter(n => typeof n == "string" && n.trim() !== "")
            //     .map(n => n.trim())
            //     .join(" ")
            //     .trim()

            // removed .trim() from previous code to support blank fonts
            return [firstname.value, midname.value, lastname.value]
                .filter(n => typeof n == "string" && n !== "")
                .join(" ")
        });

        const hasWithoutLimitFitures = computed<boolean>(() => {
            return fb.metaData.value.canChangeName && fb.metaData.value.account.name.trim().split(" ") > 1
        });

        async function changeName() {
            v$.value.$validate();

            if (v$.value.$error) {
                return;
            }

            isLoading.value = true;

            try
            {
                let response = null;

                if (fb.metaData.value.canChangeName) {
                    response = await http({
                        method: "post",
                        url: "https://accountscenter.facebook.com/api/graphql/#from=extension",
                        headers: {
                            "x-fb-friendly-name": "useFXIMNameValidatorQuery",
                            "content-type": "application/x-www-form-urlencoded"
                        },
                        data: {
                            fb_api_caller_class: "RelayModern",
                            fb_api_req_friendly_name: "useFXIMNameValidatorQuery",
                            server_timestamps: true,
                            doc_id: "6814821225214519",
                            variables: JSON.stringify({
                                identity_ids: [fb.id.value!.toString()],
                                first_name: firstname.value,
                                middle_name: midname.value,
                                last_name: lastname.value,
                                scale: 1.5,
                                platform: "FACEBOOK"
                            })
                        }
                    })
        
                    const fxValidate = response.data.data.fx_identity_management.validate_name_v2;
        
                    if (fxValidate.is_valid == false) {
                        throw fxValidate.error_message.text;
                    }
                }

                const confirm = await dialog.confirm("Are you sure you want to change your name now?", {
                    confirmText: "Yes",
                    cancelText: "No"
                });

                if (!confirm.context.isConfirmed) {
                    return;
                }

                response = await http({
                    method: "post",
                    url: "https://accountscenter.facebook.com/api/graphql/#from=extension",
                    headers: {
                        "x-fb-friendly-name": "useFXIMUpdateNameMutation",
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    data: {
                        __ccg: "EXCELLENT",
                        __hs: fb.metaData.value.hasteSession,
                        __rev: fb.metaData.value.clientRevision,
                        __hsi: fb.metaData.value.hsi,
                        __comet_req: fb.metaData.value.cometEnv,
                        fb_api_caller_class: "RelayModern",
                        fb_api_req_friendly_name: "useFXIMUpdateNameMutation",
                        server_timestamps: true,
                        doc_id: "5763510853763960",
                        variables: JSON.stringify({
                            client_mutation_id: uuidv4(),
                            family_device_id: "device_id_fetch_datr",
                            identity_ids: [fb.id.value!.toString()],
                            interface: "FB_WEB",
                            ...((withoutLimit.value || fb.metaData.value.canChangeName == false) && fb.metaData.value.changeNameDefaultValue ? {
                                full_name: fullname.value,
                                first_name: fb.metaData.value.changeNameDefaultValue.firstName,
                                middle_name: fb.metaData.value.changeNameDefaultValue.middleName,
                                last_name: fb.metaData.value.changeNameDefaultValue.lastName
                                // last_name: (
                                //     fb.metaData.value.canChangeName && (fb.metaData.value.changeNameDefaultValue.fullName.trim().split(" ").length == 1
                                //         || fb.metaData.value.changeNameDefaultValue.fullName.trim().split(" ").pop() !== fb.metaData.value.changeNameDefaultValue.lastName.trim()
                                //     )
                                // ) ? "" : fb.metaData.value.changeNameDefaultValue.lastName
                            } : {
                                full_name: fullname.value,
                                first_name: firstname.value,
                                middle_name: midname.value,
                                last_name: lastname.value,
                            })
                        })
                    }
                });

                if (response.data.errors?.[0]) {
                    throw response.data.errors[0].description.__html;
                }

                if (!response.data.data?.fxim_update_identity_name) {
                    throw "Anda masalah tidak diketahui";
                }

                if (response.data.data.fxim_update_identity_name.error) {
                    throw `${response.data.data.fxim_update_identity_name.error.description} (${response.data.data.fxim_update_identity_name.error.error_code})`;
                }

                dialog.alert("Nama berhasil diubah").then(() => {
                    window.location.reload();
                });
            }
            
            catch (e: any) {
                dialog.alert(e.toString(), { title: "Kesalahan" });
            }

            finally {
                isLoading.value = false;
            }
        }

        return () => (
            <div class={[styles.card, styles.mb_4]}>
                <div class={styles.card_body}>
                    <p class={[styles.text_center, styles.mb_3]}>
                        Changing your name too often will result in your Facebook being temporarily blocked from this feature
                    </p>
                    <div class={styles.form_control}>
                        <label
                            class={styles.form_control_label}
                            for="first-name"
                        >
                            First name
                        </label>
                        <input
                            class={[styles.form_control_input, {[styles.form_control_input_invalid]: v$.value.firstname.$error}]}
                            id="first-name"
                            placeholder="Fill in the first name"
                            v-model={firstname.value}
                            onInput={v$.value.firstname.$touch}
                        />
                        {v$.value.firstname.$error && (
                            <div class={styles.form_control_invalid_feedback}>
                                First name is required
                            </div>
                        )}
                    </div>
                    <div class={styles.form_control}>
                        <label
                            class={styles.form_control_label}
                            for="mid-name"
                        >
                            Middle Name (Optional)
                        </label>
                        <input
                            class={styles.form_control_input}
                            id="mid-name"
                            placeholder="Fill in the middle name"
                            v-model={midname.value}
                        />
                        <small>Can be ignored</small>
                    </div>
                    <div class={styles.form_control}>
                        <label
                            class={styles.form_control_label}
                            for="last-name"
                        >
                            Last Name
                        </label>
                        <input
                            class={[styles.form_control_input]}
                            id="last-name"
                            placeholder="Fill in the last name"
                            v-model={lastname.value}
                        />
                    </div>
                    {/* anti limit only works with fb whose name is more than one word */}
                    {hasWithoutLimitFitures.value && (
                        <div class={styles.form_control}>
                            <input
                                type="checkbox"
                                class={styles.form_control_input}
                                v-model={withoutLimit.value}
                                id="bypass-limit"
                            />
                            <label class={styles.form_control_label} for="bypass-limit">Anti Limit</label>
                            <small class={[styles.d_block]}>Allows you to change your name without being subject to the 60 day limit</small>
                            <small class={[styles.text_danger, styles.d_block]}>
                                If you check this section, it is possible that some names that are actually valid will be considered invalid.
                                 If there is an error message <strong>IG_NAME_VALIDATION_FAILED</strong> but if you are sure the name you are using is valid, try not to check this section.
                                 By checking this section name in <strong>About Profiles</strong> will never change.
                            </small>
                            <small class={[styles.text_danger, styles.d_block]}>
                                
                            </small>
                        </div>
                    )}
                    <button
                        class={[styles.button, styles.w_100]}
                        disabled={v$.value.$error || isLoading.value || fb.metaData.value.account.name.trim().toLowerCase() == fullname.value.trim().toLowerCase()}
                        onClick={changeName}
                    >
                        {isLoading.value ? (
                            <FontAwesomeIcon icon="spinner" spin />
                        ) : "Ubah Nama"}
                    </button>
                </div>
            </div>
        )
    }
})
