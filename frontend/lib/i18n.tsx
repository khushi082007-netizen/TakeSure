"use client";
/**
 * Lightweight UI translation (English / Hindi). The *medical content* (knowledge-base rows, explanations) is
 * bilingual on the server; this dictionary covers navigation, headings and controls so the whole interface can
 * switch, not only the explanation text. The choice is remembered in localStorage.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";

export type UiLang = "en" | "hi";

const DICT = {
  en: {
    // nav
    nav_check: "Safety checker",
    nav_kb: "Knowledge base",
    nav_how: "How it works",
    nav_adr: "Report a reaction",
    nav_dashboard: "Dashboard",
    nav_about: "About & methodology",
    nav_cta: "Check safety",
    menu: "Menu",
    close: "Close",
    lang_toggle_label: "Interface language",
    // common
    usp: "Verdict from published data; AI only explains.",
    loading: "Loading…",
    retry: "Try again",
    manual_entry: "Enter names manually",
    step_of: "Step {n} of 3",
    kb_version: "Knowledge base version",
    not_medical: "Educational information, not medical advice.",
    // hero
    hero_badge1: "Verdict from data · AI only explains",
    hero_badge2: "Hindi + English",
    hero_badge3: "Ministry of Ayush ADR format",
    hero_title_a: "Is it safe to take this",
    hero_title_b: "Ayurvedic product",
    hero_title_c: "with my medicines?",
    hero_quote: "“India's first safety layer between the two medical systems people already mix.”",
    hero_lede: "Most patients never tell their doctor about Ashwagandha, Giloy or Chyawanprash. TakeSure reads your prescription and the product label, checks the pair against published evidence, and tells you — in Hindi or English — what to discuss at your next visit.",
    hero_regions: "Covers today:",
    hero_cta: "Check safety",
    hero_cta2: "See how it works",
    hero_privacy: "No account. Photos are read and deleted immediately. Nothing you upload is stored.",
    hero_card_title: "LIVE SAFETY FEED",
    hero_card_sub: "Real knowledge base · simulated queries",
    // sections
    problem_label: "THE QUIET PROBLEM",
    problem_title_a: "Two medical systems,",
    problem_title_b: "zero cross-checks.",
    problem_body: "A thyroid patient on Thyronorm adds ashwagandha for stress. A transplant patient on tacrolimus drinks giloy kadha. A cardiac patient on warfarin takes guggul for cholesterol. The allopathic doctor rarely asks, the patient rarely tells, the chemist has no tool, and the label says nothing.",
    stat1: "of hospital patients used allopathic + herbal medicines together",
    stat2: "of herbal users lacked knowledge of dose, side effects and interactions",
    stat3: "of Indian patients disclose herbal use to their doctor",
    stat4: "public tools that check an Ayurvedic product against an allopathic prescription",
    pipeline_label: "FROM PHOTO TO VERDICT",
    pipeline_title_a: "How TakeSure works.",
    pipeline_sub: "Deterministic core, AI at the edges. The verdict never comes from a language model.",
    active_stage: "ACTIVE STAGE",
    stage_status: "STAGE STATUS",
    caps_label: "WHAT YOU GET",
    caps_title_a: "From a blurry photo to",
    caps_title_b: "a sourced conversation with your doctor.",
    caps_sub: "Built for patients and families first; useful for doctors, vaidyas, pharmacists and the Ministry's pharmacovigilance network.",
    view_details: "Open",
    compare_label: "THE SHIFT",
    compare_title_a: "Finding out after the reaction",
    compare_title_b: "versus knowing before the first dose.",
    compare_sub: "Moving herb–drug safety from an emergency-room discovery to a sixty-second check at the chemist counter.",
    today: "TODAY / REACTIVE",
    with_takesure: "TAKESURE / PREVENTIVE",
    kb_label: "THE KNOWLEDGE BASE",
    kb_title_a: "Every verdict traces to a row.",
    kb_title_b: "Every row traces to a source.",
    kb_browse: "Browse every row and its sources",
    kb_stat_rows: "Interaction rows",
    kb_stat_herbs: "Herbs & formulations",
    kb_stat_drugs: "Medicines (generics)",
    kb_stat_sources: "Cited sources",
    dash_label: "THE MINISTRY VIEW",
    dash_title_a: "One view of what India",
    dash_title_b: "is actually mixing.",
    dash_sub: "Anonymised co-use analytics, verdict trends and suspected-reaction reports — the signal the pharmacovigilance network has never had.",
    dash_cta: "Open the dashboard",
    arch_label: "UNDER THE SURFACE",
    arch_title_a: "Built so the AI",
    arch_title_b: "cannot make things up.",
    arch_sub: "A connected architecture where data decides and language models only translate.",
    demo_label: "DEMO MODE",
    demo_title: "Try it without a photo",
    demo_sub: "These scenarios skip the camera but run the real matching, rule engine and explainer against the live knowledge base — nothing is pre-rendered.",
    demo_own: "Use my own prescription",
    cta_label: "AYURVEDA × ALLOPATHY",
    cta_title_a: "Know the risk",
    cta_title_b: "before the first dose.",
    cta_sub: "Free for citizens. Open knowledge base. Aligned with the Ministry of Ayush Pharmacovigilance Programme.",
    expected: "expected",
    run: "Run",
    running: "Running…",
    demo_chip: "demo",
    // check page
    check_title: "Safety checker",
    check_lede: "Upload a photo of the prescription and of the Ayurvedic product label, or type the names. We show you what was read before anything is checked.",
    tab_photo: "Upload photos",
    tab_manual: "Type the names",
    rx_label: "Prescription",
    rx_hint: "Doctor's slip or the medicine strips",
    product_label: "Ayurvedic product",
    product_hint: "The front or ingredients side of the pack",
    read_continue: "Read and continue",
    tips_title: "Tips for a good photo",
    privacy_title: "Privacy",
    // review
    review_title: "Review what we found",
    review_lede: "Nothing is checked until you confirm. Remove anything wrong, fix uncertain matches, and add anything we missed.",
    confirm_check: "Confirm and check safety",
    // results
    results_title: "Safety result",
    // kb page
    kbpage_title: "Every interaction we know about — and where it comes from",
    kbpage_lede: "Search by herb, medicine, Indian brand name or Hindi name. Each row carries a severity, an evidence grade and at least one citation. Rows are the only thing that can produce a verdict.",
    // adr
    adr_label: "Pharmacovigilance",
    adr_title: "Report a suspected adverse reaction",
    adr_lede: "Fill in the fields of the Ministry of Ayush suspected-ADR form. TakeSure generates a PDF you can hand to your doctor or submit on the official portal. TakeSure does not submit anything to the government itself.",
    // dashboard
    dashboard_title: "Pharmacovigilance dashboard",
    dashboard_lede: "Anonymised view of what is being checked, which verdicts result, and the suspected-reaction reports prepared. No photos, names or IP addresses are ever stored.",
    // footer
    footer_important: "Important",
    footer_disclaimer: "TakeSure is an educational safety aid. It is not a diagnosis, not a prescription, and not a substitute for your doctor, vaidya or pharmacist. Never start or stop a medicine because of what you read here.",
    footer_links: "Links",
    footer_built: "Built by Team Bug Hunters. Open knowledge base, cited sources, decision support only.",
  },
  hi: {
    nav_check: "सुरक्षा जाँच",
    nav_kb: "ज्ञान-आधार",
    nav_how: "यह कैसे काम करता है",
    nav_adr: "प्रतिक्रिया रिपोर्ट करें",
    nav_dashboard: "डैशबोर्ड",
    nav_about: "हमारे बारे में",
    nav_cta: "सुरक्षा जाँचें",
    menu: "मेनू",
    close: "बंद करें",
    lang_toggle_label: "भाषा",
    usp: "निर्णय प्रकाशित डेटा से; AI केवल समझाता है।",
    loading: "लोड हो रहा है…",
    retry: "फिर कोशिश करें",
    manual_entry: "नाम खुद लिखें",
    step_of: "चरण {n} / 3",
    kb_version: "ज्ञान-आधार संस्करण",
    not_medical: "शैक्षिक जानकारी, चिकित्सकीय सलाह नहीं।",
    hero_badge1: "निर्णय डेटा से · AI केवल समझाता है",
    hero_badge2: "हिन्दी + अंग्रेज़ी",
    hero_badge3: "आयुष मंत्रालय ADR प्रारूप",
    hero_title_a: "क्या यह",
    hero_title_b: "आयुर्वेदिक उत्पाद",
    hero_title_c: "मेरी दवाइयों के साथ सुरक्षित है?",
    hero_quote: "“भारत की पहली सुरक्षा-परत, उन दो चिकित्सा पद्धतियों के बीच जिन्हें लोग पहले से साथ लेते हैं।”",
    hero_lede: "ज़्यादातर मरीज़ अपने डॉक्टर को अश्वगंधा, गिलोय या च्यवनप्राश के बारे में नहीं बताते। TakeSure आपका पर्चा और उत्पाद का लेबल पढ़ता है, प्रकाशित प्रमाणों से जोड़ी की जाँच करता है, और हिन्दी या अंग्रेज़ी में बताता है कि अगली बार डॉक्टर से क्या पूछें।",
    hero_regions: "अभी शामिल:",
    hero_cta: "सुरक्षा जाँचें",
    hero_cta2: "कैसे काम करता है",
    hero_privacy: "कोई खाता नहीं। फ़ोटो पढ़ते ही हटा दी जाती है। आपका अपलोड सहेजा नहीं जाता।",
    hero_card_title: "लाइव सुरक्षा फ़ीड",
    hero_card_sub: "असली ज्ञान-आधार · नमूना जाँचें",
    problem_label: "चुपचाप बढ़ती समस्या",
    problem_title_a: "दो चिकित्सा पद्धतियाँ,",
    problem_title_b: "कोई आपसी जाँच नहीं।",
    problem_body: "थायरॉइड का मरीज़ थायरोनॉर्म के साथ तनाव के लिए अश्वगंधा लेता है। ट्रांसप्लांट का मरीज़ टैक्रोलिमस के साथ गिलोय का काढ़ा पीता है। हृदय-रोगी वारफ़रिन के साथ कोलेस्ट्रॉल के लिए गुग्गुल लेता है। डॉक्टर कम पूछते हैं, मरीज़ कम बताते हैं, केमिस्ट के पास कोई साधन नहीं, और लेबल पर कुछ नहीं लिखा।",
    stat1: "अस्पताल के मरीज़ एलोपैथिक + हर्बल दवाइयाँ साथ लेते थे",
    stat2: "हर्बल उपयोगकर्ताओं को खुराक, दुष्प्रभाव और इंटरैक्शन की जानकारी नहीं थी",
    stat3: "भारतीय मरीज़ ही डॉक्टर को हर्बल उपयोग बताते हैं",
    stat4: "सार्वजनिक साधन जो आयुर्वेदिक उत्पाद को एलोपैथिक पर्चे से जाँचते हों",
    pipeline_label: "फ़ोटो से निर्णय तक",
    pipeline_title_a: "TakeSure कैसे काम करता है।",
    pipeline_sub: "निर्धारित (deterministic) केंद्र, किनारों पर AI। निर्णय कभी भाषा-मॉडल से नहीं आता।",
    active_stage: "सक्रिय चरण",
    stage_status: "चरण की स्थिति",
    caps_label: "आपको क्या मिलता है",
    caps_title_a: "धुंधली फ़ोटो से",
    caps_title_b: "डॉक्टर के साथ प्रमाण-आधारित बातचीत तक।",
    caps_sub: "सबसे पहले मरीज़ों और परिवारों के लिए; डॉक्टर, वैद्य, फार्मासिस्ट और मंत्रालय के फार्माकोविजिलेंस नेटवर्क के लिए भी उपयोगी।",
    view_details: "खोलें",
    compare_label: "बदलाव",
    compare_title_a: "प्रतिक्रिया के बाद पता चलना",
    compare_title_b: "बनाम पहली खुराक से पहले जानना।",
    compare_sub: "जड़ी-बूटी–दवा सुरक्षा को इमरजेंसी-रूम की खोज से केमिस्ट की दुकान पर साठ-सेकंड की जाँच में बदलना।",
    today: "आज / प्रतिक्रियात्मक",
    with_takesure: "TAKESURE / निवारक",
    kb_label: "ज्ञान-आधार",
    kb_title_a: "हर निर्णय एक पंक्ति से जुड़ा है।",
    kb_title_b: "हर पंक्ति एक स्रोत से।",
    kb_browse: "हर पंक्ति और उसके स्रोत देखें",
    kb_stat_rows: "इंटरैक्शन पंक्तियाँ",
    kb_stat_herbs: "जड़ी-बूटियाँ व योग",
    kb_stat_drugs: "दवाइयाँ (जेनेरिक)",
    kb_stat_sources: "उद्धृत स्रोत",
    dash_label: "मंत्रालय का दृश्य",
    dash_title_a: "एक नज़र में — भारत",
    dash_title_b: "असल में क्या साथ ले रहा है।",
    dash_sub: "गुमनाम सह-उपयोग विश्लेषण, निर्णय के रुझान और संदिग्ध-प्रतिक्रिया रिपोर्टें — वह संकेत जो फार्माकोविजिलेंस नेटवर्क के पास कभी नहीं था।",
    dash_cta: "डैशबोर्ड खोलें",
    arch_label: "भीतर की बनावट",
    arch_title_a: "ऐसा बनाया गया कि AI",
    arch_title_b: "कुछ गढ़ न सके।",
    arch_sub: "एक जुड़ी हुई संरचना जहाँ डेटा निर्णय लेता है और भाषा-मॉडल केवल अनुवाद करता है।",
    demo_label: "डेमो मोड",
    demo_title: "बिना फ़ोटो के आज़माएँ",
    demo_sub: "ये परिदृश्य कैमरा छोड़ देते हैं, पर असली मिलान, नियम-इंजन और व्याख्याकार को लाइव ज्ञान-आधार पर चलाते हैं — कुछ भी पहले से बना नहीं है।",
    demo_own: "अपना पर्चा इस्तेमाल करें",
    cta_label: "आयुर्वेद × एलोपैथी",
    cta_title_a: "जोखिम जानें",
    cta_title_b: "पहली खुराक से पहले।",
    cta_sub: "नागरिकों के लिए मुफ़्त। खुला ज्ञान-आधार। आयुष मंत्रालय फार्माकोविजिलेंस कार्यक्रम के अनुरूप।",
    expected: "अपेक्षित",
    run: "चलाएँ",
    running: "चल रहा है…",
    demo_chip: "डेमो",
    check_title: "सुरक्षा जाँच",
    check_lede: "पर्चे और आयुर्वेदिक उत्पाद के लेबल की फ़ोटो अपलोड करें, या नाम लिखें। कुछ भी जाँचने से पहले हम दिखाते हैं कि क्या पढ़ा गया।",
    tab_photo: "फ़ोटो अपलोड करें",
    tab_manual: "नाम लिखें",
    rx_label: "पर्चा",
    rx_hint: "डॉक्टर की पर्ची या दवा की स्ट्रिप",
    product_label: "आयुर्वेदिक उत्पाद",
    product_hint: "पैक का अगला हिस्सा या सामग्री वाला हिस्सा",
    read_continue: "पढ़ें और आगे बढ़ें",
    tips_title: "अच्छी फ़ोटो के लिए सुझाव",
    privacy_title: "गोपनीयता",
    review_title: "जो मिला उसकी समीक्षा करें",
    review_lede: "आपकी पुष्टि के बिना कुछ भी जाँचा नहीं जाता। गलत हटाएँ, अनिश्चित मिलान ठीक करें, और छूटा हुआ जोड़ें।",
    confirm_check: "पुष्टि करें और सुरक्षा जाँचें",
    results_title: "सुरक्षा परिणाम",
    kbpage_title: "हर इंटरैक्शन जो हम जानते हैं — और वह कहाँ से आया",
    kbpage_lede: "जड़ी-बूटी, दवा, भारतीय ब्रांड या हिन्दी नाम से खोजें। हर पंक्ति में गंभीरता, प्रमाण-स्तर और कम से कम एक उद्धरण है। केवल पंक्तियाँ ही निर्णय दे सकती हैं।",
    adr_label: "फार्माकोविजिलेंस",
    adr_title: "संदिग्ध प्रतिकूल प्रतिक्रिया की रिपोर्ट करें",
    adr_lede: "आयुष मंत्रालय के संदिग्ध-ADR फ़ॉर्म के फ़ील्ड भरें। TakeSure एक PDF बनाता है जिसे आप डॉक्टर को दे सकते हैं या आधिकारिक पोर्टल पर जमा कर सकते हैं। TakeSure स्वयं सरकार को कुछ नहीं भेजता।",
    dashboard_title: "फार्माकोविजिलेंस डैशबोर्ड",
    dashboard_lede: "क्या जाँचा जा रहा है, कौन-से निर्णय निकलते हैं और कौन-सी संदिग्ध-प्रतिक्रिया रिपोर्टें तैयार हुईं — इसका गुमनाम दृश्य। फ़ोटो, नाम या IP पता कभी सहेजा नहीं जाता।",
    footer_important: "महत्वपूर्ण",
    footer_disclaimer: "TakeSure एक शैक्षिक सुरक्षा-सहायक है। यह निदान नहीं, पर्चा नहीं, और आपके डॉक्टर, वैद्य या फार्मासिस्ट का विकल्प नहीं है। यहाँ पढ़कर कोई दवा शुरू या बंद न करें।",
    footer_links: "लिंक",
    footer_built: "टीम Bug Hunters द्वारा निर्मित। खुला ज्ञान-आधार, उद्धृत स्रोत, केवल निर्णय-सहायता।",
  },
} as const;

export type TKey = keyof typeof DICT.en;

interface Ctx {
  lang: UiLang;
  setLang: (l: UiLang) => void;
  t: (k: TKey, vars?: Record<string, string | number>) => string;
}

const LangContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => DICT.en[k] });
const KEY = "takesure.ui.lang";

const KEY_EVENT = "takesure:lang";

function readLang(): UiLang {
  try {
    const saved = window.localStorage.getItem(KEY);
    return saved === "hi" ? "hi" : "en";
  } catch {
    return "en";
  }
}
function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(KEY_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(KEY_EVENT, cb);
  };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // localStorage is the external store; the server snapshot is always English so hydration matches.
  const lang = useSyncExternalStore(subscribe, readLang, () => "en" as UiLang);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.classList.toggle("font-hindi", lang === "hi");
  }, [lang]);
  const setLang = useCallback((l: UiLang) => {
    try {
      window.localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(KEY_EVENT));
  }, []);
  const t = useCallback(
    (k: TKey, vars?: Record<string, string | number>) => {
      let s: string = (DICT[lang] as Record<string, string>)[k] ?? DICT.en[k];
      if (vars) for (const [key, v] of Object.entries(vars)) s = s.replace(`{${key}}`, String(v));
      return s;
    },
    [lang],
  );
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
