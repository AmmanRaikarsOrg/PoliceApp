
import React, { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "../components/common/Button";

import {
  shareDocx,
} from "../services/documents/docxFileService";

export function MarkdownDocxTestScreen() {
  const [loading, setLoading] =
    useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const TEST_MARKDOWN = `
        C¥ÀgÁzsÀ ¸ÀÜ¼ÀzÀ ¥ÀAZÀ£ÁªÉÄ

        ==============================================

        F PÉ¼ÀUÉ ¸À» ªÀiÁrzÀ ¥ÀAZÀ d£ÀgÁzÀ,

        1] ²æÃ ¸ÀÄPÉÃ±À «oÀ×® zÉÃªÁrUÀ, ªÀAiÀÄ¸ÀÄì-23 ªÀµÀð, eÁw-»AzÀÆ zÉªÁrUÀ, GzÉÆåÃUÀ- ºÉÆmÉÃ¯ïzÀ°è PÉ®¸À, ¸Á|| Dgï.¹ £ÀUÀgÀ, GzÀåªÀÄ¨ÁUÀ, ¨É¼ÀUÁ«, SÁAiÀÄA «¼Á¸À- ±ÁAw PÁ¯ÉÆ¤, 6£ÉÃ PÁæ¸ï, PÀªÀÄ¯Á¥ÀÆgÀ gÉÆÃqÀ, vÁ|| f|| zÁgÀªÁqÀ ªÉÆÃ £ÀA- 9353583134

        2] ²æÃ dw£À ±ÉÃRgÀ ±ÉnÖ, ªÀAiÀÄ¸ÀÄì- 25 ªÀµÀð, eÁw- »AzÀÆ ±Àlðn, GzÉÆåÃUÀ- ºÉÆmÉÃ¯ïzÀ°è PÉ®¸À, ¸Á|| Dgï.¹ £ÀUÀgÀ, GzÀåªÀÄ¨ÁUÀ, ¨É¼ÀUÁ«, ªÉÆÃ £ÀA 7829798241

        £ÁªÀÅ mÉÊ¥ï ªÀiÁr¹ PÉÆqÀÄªÀ ¥ÀAZÀ£ÁªÉÄ K£ÉAzÀgÉ,

        F ¢ªÀ¸À ¢£ÁAPÀ 10/08/2025 gÀAzÀÄ £ÀªÀÄUÉ GzÀåªÀÄ¨ÁUÀ ¥ÉÆ°Ã¸À oÁuÉAiÀÄ ¥ÉÆ°Ã¸À ¸À¨ï E£Àì¥ÉÃPÀÖgÀgÀªÀgÁzÀ ²æÃ. QgÀt ¹ ºÉÆ£ÀPÀnÖ EªÀgÀÄ vÀªÀÄä ¥ÉÆ°Ã¸À oÁuÉAiÀÄ ¹§âA¢ ²æÃ ºÀtªÀÄAvÀ «¨sÀÆw ¹.¦.¹ 1605 EªÀgÀ ªÀÄÄSÁAvÀgÀ £ÀªÀÄUÉ GzÀåªÀÄ¨ÁUÀzÀ GvÀìªÀ qÀ§¯ï gÉÆÃqÀzÀ°ègÀÄªÀ ¸ÀÄSÉÆÃzÀAiÀÄ ¯ÁqÀÓ ºÀwÛgÀ PÀgÉ¬Ä¹zÀAvÉ §AzÀÄ ºÁdgÁzÉÃªÀÅ, E°è ºÁdjzÀÝ ¦.J¸ï.LgÀªÀgÀÄ £ÀªÀÄUÉ GzÀåªÀÄ¨ÁUÀ ¥ÉÆ°Ã¸À oÁuÉAiÀÄ C¥ÀgÁzsÀ ¸ÀASÉå 46/2025 PÀ®A 115(2), 118(1), 126(2), 352, 351(2), ¸ÀºÀ PÀ®A 3(5) ©.J£ï.J¸ï -2023 £ÉÃzÀÝgÀ ¥ÀæPÀgÀtzÀ°è ºÁdjzÀÝ ¦AiÀiÁð¢AiÀiÁzÀ ²æÃ dÄUÀ£À ¸ÀÄRzÉÃªÀ ¸ÀºÁ ¸Á|| ©¸À£À¥ÀÆgÀ, ¥ÉÆÃ¸ÀÖ ©¸À£À¥ÀÆgÀ f|| ¸ÁºÉÃ§UÀAd gÁdå|| eÁRðAqÀ ºÁ° ªÀ¹Û|| ªÀÄAzÁgÀQ ºÉÆmÉÃ® ©Ã°ØAUÀ ¨É¼ÀUÁ« EªÀgÀ£ÀÄß ¥ÀjZÀAiÀÄ ªÀiÁr¹, ¸ÀzÀgÀ ¥ÀæPÀgÀtzÀ°è F ¢ªÀ¸À ¦AiÀiÁð¢AiÀÄ vÉÆÃj¸ÀÄªÀ C¥ÀgÁzsÀ ¸ÀÜ¼ÀzÀ ¥ÀAZÀ£ÁªÉÄ ªÀiÁqÀÄªÀªÀjzÀÄÝ¢Ã ¥ÀAZÀ£ÁªÉÄ PÁ®PÉÌ vÁªÀÅ ¥ÀAZÀgÀÄ CAvÁ £ÀªÉÆäA¢UÉ ºÁdjzÀÄÝ, ¸À«¸ÁÛgÀªÁzÀ ¥ÀAZÀ£ÁªÉÄAiÀÄ£ÀÄß mÉÊ¥À ªÀiÁr¹PÉÆqÀ®Ä PÉÃ½PÉÆAqÀAvÉ £ÁªÀÅ CzÀPÉÌ M¦àPÉÆAqÀÄ ºÁdgÀÄ½zÉÃªÀÅ, £ÀAvÀgÀ £ÀªÀÄUÉ ¥ÉÆ°Ã¸À C¢üPÁjUÀ¼ÀÄ £ÉÆÃn¸ï PÉÆlÄÖ ¸À» ¥ÀqÉzÀÄPÉÆAqÀgÀÄ. £ÀAvÀgÀ WÀl£Á ¸ÀÜ¼ÀzÀ°è ºÁdjzÀÝ ¦AiÀiÁð¢AiÀiÁzÀ ²æÃ dÄUÀ£À ¸ÀÄRzÉÃªÀ ¸ÀºÁ EªÀgÀÄ ºÉÃ½ vÉÆÃj¹zÀ C¥ÀgÁzÀ ¸ÀÜ¼ÀªÀ£ÀÄß £ÉÆÃrzÀÄÝ CzÀgÀ «ªÀgÀ F PÉ¼ÀV£ÀAvÉ EgÀÄvÀÛzÉ.

        F ¸ÀÜ¼ÀªÀÅ GzÀåªÀÄ¨ÁUÀ ¥ÉÆ°Ã¸ï oÁuÉ ºÀ¢ÝAiÀÄ°ègÀÄªÀ GvÀìªÀ qÀ§¯ï gÉÆÃqÀ£À°ègÀÄªÀ ¸ÀÄSÉÆzÀAiÀÄ ¯ÁqÀÓ£À ªÀÄÄA¢gÀÄªÀ ¸ÁªÀðd¤PÀ gÀ¸ÉÛAiÀÄ ¥ÀPÀÌzÀ°è EzÀÄÝ, E°è ºÁdjzÀÝ ¦AiÀiÁð¢AiÀiÁzÀ ²æÃ dÄUÀ£À ¸ÀÄRzÉÃªÀ ¸ÀºÁ EªÀjUÉ «ZÁj¹zÁUÀ CªÀgÀÄ £Á£ÀÄ GzÀåªÀÄ¨ÁUÀzÀ°ègÀÄªÀ ¥ÀAdÄ°ð ºÉÆmÉÃ®zÀ°è PÀ¼ÉzÀ 04 ªÀµÀðUÀ½AzÀ PÉ®¸À ªÀiÁrPÉÆArzÀÄÝ, CzÉÃ ºÉÆmÉ¯ïzÀ°è PÉ®¸À ªÀiÁqÀÄªÀ ªÀÄ£ÉÆÃd ¸Á§tÚ qÀ§â£ÀßªÀgÀ ¸Á|| ºÀÄAZÁå£ÀnÖ, ¨É¼ÀUÁ« EvÀ£ÀÄ PÉ®¸À ªÀiÁqÀÄªÀ ¸ÀªÀÄAiÀÄzÀ°è £À£Àß eÉÆÃvÉ ¸ÀtÚ ¥ÀÄlÖ dUÀ¼ÀªÁUÀÄwÛzÀÝjAzÀ £ÀªÀÄä ºÉÆmÉÃ¯ï£À ªÀiÁå£ÉÃdgÀ ºÁUÀÆ PÉ®¸À ªÀiÁqÀÄªÀ ¹§âA¢ d£ÀgÀÄ £ÀªÀÄä dUÀ¼ÀªÀ£ÀÄß §UÉºÀj¹zÀÝgÀÄ. DzÀgÉ ¤£ÉßAiÀÄ ¢£À ¢£ÁAPÀ: 09/08/2025 gÀAzÀÄ £Á£ÀÄ gÁwæ 11:40 UÀAmÉAiÀÄ ¸ÀÄªÀiÁjUÉ ºÉÆmÉÃ¯ï PÉ®¸À ªÀÄÄV¹PÉÆAqÀÄ gÀÆªÀÄPÀqÉ ºÉÆUÀÄwÛzÁÝUÀ EzÉÃ ¸ÀÜ¼ÀzÀ°è ªÀÄ£ÉÆÃd ¸Á§tÚ qÀ§â£ÀßªÀgÀ FvÀ£ÀÄ vÀ£Àß eÉÆÃvÉ AiÀiÁgÉÆÃ E§âgÀ£ÀÄß PÀgÉzÀÄPÉÆAqÀÄ §AzÀªÀ£ÉÃ £À£Àß£ÀÄß CqÀØUÀnÖ ¤°è¹, ¤Ã£ÀÄ ºÉÆmÉÃ¯ï£À°è £À£ÉÆßA¢UÉ dUÀ¼ÀªÁqÀÄwÛAiÀiÁ “ªÀiÁzÀgÀ ZÉÆÃzÀ” CAvÁ CªÁZÀåªÁV ¨ÉÊzÀÄ ªÀÄÆgÀÄ d£ÀgÀÄ PÉÊ¬ÄAzÀ £À£ÀUÉ ºÉÆr§r ªÀiÁrzÀÄÝ, £ÀAvÀgÀ ªÀÄ£ÉÆÃd qÀ§â£ÀßªÀgÀ EvÀ£ÀÄ E¯ÉèÃ gÀ¸ÉÛAiÀÄ ¥ÀPÀÌzÀ°è ©¢ÝzÀÝ ¹ªÉÄÃAl EnÖUÉAiÀÄ vÀÄAr¤AzÀ £À£Àß vÉ¯ÉUÉ ºÉÆqÉzÀÄ gÀPÀÛ UÁAiÀÄ¥Àr¹ fÃªÀzÀ zsÀªÀÄQ PÉÆnÖgÀÄªÀ ¸ÀÜ¼À EzÉÃ EgÀÄvÀÛzÉ CAvÁ ºÉÃ½ vÉÆÃj¹, E¯ÉèÃ gÀ¸ÉÛAiÀÄ ¥ÀPÀÌzÀ°è ©¢ÝzÀÝ MAzÀÄ ¹ªÉÄÃAmï EnÖUÉAiÀÄ vÀÄAqÀ£ÀÄß vÉÆÃj¹, EzÉÃ ¹ªÉÄAl EnÖUÉ¬ÄAzÀ £À£ÀUÉ ºÉÆr§r ªÀiÁr E¯ÉèÃ MUÉzÀÄ ºÉÆÃVgÀÄvÁÛgÉ CAvÁ ºÉÃ½ vÉÆÃj¹ ºÁdgÀÄ¥Àr¹zÀÄÝ EzÀgÀ «ªÀgÀ

        1] MqÉzÀ ¹ªÉÄÃAmï EnÖUÉAiÀÄ vÀÄAqÀÄ MAzÀÄ CQ- 00

        F ¥ÀæPÁgÀ EzÀÄÝ EzÀ£ÀÄß ¦.J¸ï.LgÀªÀgÀÄ ªÉÄÃ°£À ¥ÀæPÀgÀtzÀ°è ¥ÀÄgÁªÉ PÀÄjvÀÄ d¥ÀÛ ªÀiÁr CzÀPÉÌ £ÀªÀÄä ªÀ ºÁUÀÆ vÀªÀÄä ¸À»AiÀÄÄ¼Àî aÃnAiÀÄ£ÀÄß CAn¹ vÀªÀÄä ªÀ±ÀPÉÌ ¥ÀqÉzÀÄPÉÆAqÀgÀÄ.

        F C¥ÀgÁzsÀ ¸ÀÜ¼ÀzÀ ¥ÀÆªÀðPÉÌ 50 «ÄÃlgï CAvÀgÀzÀ°è zÀQëuÉÆÃvÀÛgÁªÁV ¸ÁVgÀÄªÀ ¨É¼ÀUÁ« SÁ£Á¥ÀÆgÀ gÀ¸ÉÛ, ¥À²ÑªÀÄPÉÌ gÁtÂ ZÉ£ÀßªÀÄä £ÀUÀgÀzÀ PÀqÉUÉ ¸ÁVgÀÄªÀ gÀ¸ÉÛ, GvÀÛgÀPÉÌ 10 ¥ÀÆl CAvÀgÀzÀ°è PÉ.E.© PÀgÉAl PÀA§ CzÀgÀºÉÆA¢UÉ ¸ÀÄSÉÆÃzÀAiÀÄ ¯ÁqÀÓ, zÀQëtPÉÌ ¥ÀÆªÀð ¥À²ÑªÀÄªÁV ¸ÁVgÀÄªÀ GvÀìªÀ qÀ§â® gÀ¸ÉÛ EgÀÄvÀÛzÉ CAvÁ £ÁªÀÅ ºÁdjzÀÄÝ £ÉÆÃr PÉÃ½, ºÉÃ½ mÉÊ¥À ªÀiÁr¹PÉÆlÖ ¥ÀAZÀ£ÁªÉÄ ¢£ÁAPÀ: 10/08/2025

        F ¥ÀAZÀ£ÁªÉÄAiÀÄ£ÀÄß ¸ÀzÀj eÁUÉAiÀÄ°è PÀÄ½vÀÄ F ¢ªÀ¸À ¢£ÁAPÀ 10/08/2025 gÀAzÀÄ 11:00 UÀAmÉ¬ÄAzÀ 12:00 UÀAmÉAiÀÄªÀgÀUÉ mÉÊ¥À ªÀiÁr ªÀÄÄV¹, £ÀAvÀgÀ ¥ÉÆ°Ã¸ï oÁuÉUÉ §AzÀÄ ¦æAmï vÉUÉzÀÄ ¸À» ªÀiÁrzÀÄÝ EgÀÄvÀÛzÉ.

        £À£Àß ¸ÀªÀÄPÀëªÀÄ N.ºÉÃ.PÉÃ.¸Àj CzÉ.

        (QgÀt ¹ ºÉÆ£ÀPÀnÖ) 1]

        ¦.J¸ï.L (PÁ&¸ÀÄ)

        GzÀåªÀÄ¨ÁUÀ ¥ÉÆ°Ã¸À oÁuÉ 2]

        ¦AiÀiÁð¢AiÀÄ ¸À»:

        ¥ÉÆÃmÉÆÃ/«rAiÉÆÃ ªÀiÁrzÀªÀgÀ ¸À»:

        ¥ÀAZÀ£ÁªÉÄ mÉÊ¥À ªÀiÁrzÀªÀgÀ ¸À»:
        `;
      const uri =
        await shareDocx(
          TEST_MARKDOWN,
          "case-file-test.docx"
        );

      console.log(
        "Successfully generated:",
        uri
      );

      Alert.alert(
        "Success",
        "DOCX generated successfully."
      );
    } catch (error) {
      console.error(
        "DOCX generation failed:",
        error
      );

      Alert.alert(
        "DOCX Generation Failed",
        error instanceof Error
          ? error.message
          : String(error)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        DOCX Generation Test
      </Text>

      <Text style={styles.description}>
        This test generates a Word document
        directly on the Android device without
        using the backend.
      </Text>

      <Button
        title={
          loading
            ? "Generating..."
            : "Generate Test DOCX"
        }
        onPress={handleGenerate}
      />

      {loading && (
        <ActivityIndicator
          style={styles.loader}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0D10",
    padding: 24,
    justifyContent: "center",
    gap: 20,
  },

  title: {
    color: "#F4F5F7",
    fontSize: 28,
    fontWeight: "800",
  },

  description: {
    color: "#9AA3AF",
    fontSize: 16,
    lineHeight: 24,
  },

  loader: {
    marginTop: 10,
  },
});