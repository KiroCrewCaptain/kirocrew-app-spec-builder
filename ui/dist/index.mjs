import { ChatEmbed, activeLocale, fmtNumber, useAppApi, useImeGuard, useLanguageGeneration } from "@kirocrew/app-sdk";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ui from "@kirocrew/app-sdk/ui";
import { Btn, Clickable, EmptyState, ErrorNotice, Input, MarkdownRenderer, Modal, SearchInput, SegmentedControl } from "@kirocrew/app-sdk/ui";
import { AlertTriangle, Archive, ArchiveRestore, ArrowLeft, ArrowUp, Check, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, ChevronsRight, Circle, Clock, Copy, FileText, Folder, GitBranch, ListChecks, Maximize2, MessageSquare, Minimize2, MoreHorizontal, Pause, Pencil, Play, Plus, Settings, Sparkles, Trash2, Wrench, X, Zap } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
// src/i18n.ts
/**
* The app's own strings. A bundle cannot read the dashboard's catalogs (those
* belong to the host and change with it), so every locale the dashboard ships is
* bundled here and looked up against the host's active language.
*
* The catalogs (`ui/i18n/<locale>.json`) are the `apps.specBuilder.*` subtree
* copied from Kiro Crew's dashboard catalogs (for English, its generated and
* hand-authored catalogs merged), under the SAME key paths, so every call site
* reads as it did in the built-in.
*
* Lookup order: the exact locale (`pt`, `zh-CN`), then its base language, then
* English, then the key itself. A numeric `count` selects the plural form the
* locale's rules name (`_one`, `_few`, `_many`, `_other`), as the dashboard's own
* catalogs are keyed. `{{name}}` placeholders are filled from `vars`; one with no
* value is left as written.
*
* `t` reads the language at call time. The root component subscribes to the
* host's language changes (`useLanguageGeneration`), and its re-render reaches
* every child, so a language switch repaints the page without a reload.
*/
var CATALOGS = {
	bn: {
		apps: /* @__PURE__ */ JSON.parse("{\"specBuilder\":{\"api\":{\"phase_building\":\"বানানো হচ্ছে\",\"phase_design\":\"ডিজাইন\",\"phase_new\":\"সদ্য শুরু\",\"phase_ready\":\"প্রস্তুত\",\"phase_requirements\":\"চাহিদা\",\"phase_tasks\":\"পরিকল্পনা তৈরি\",\"something_went_wrong\":\"কিছু একটা ভুল হয়েছে ({{status}})\"},\"components\":{\"chatColumn\":{\"reply_to_the_spec_agent\":\"Spec এজেন্টকে উত্তর দিন…\"},\"columnSplitter\":{\"drag_or_use_to_resize\":\"আকার বদলাতে টানুন বা ← → ব্যবহার করুন\"},\"docView\":{\"add_comment\":\"মন্তব্য যোগ করুন\",\"comment\":\"মন্তব্য করুন\",\"comment_on_the_selected_passage\":\"নির্বাচিত অংশে মন্তব্য করুন\",\"discard_this_comment\":\"এই মন্তব্যটি বাতিল করুন\",\"document_file_name\":\"{{name}}.md\",\"empty_design\":\"এখনও কোনো ডিজাইন নেই। কথোপকথনে চাহিদা অনুমোদন করলে প্রযুক্তিগত ডিজাইন এখানে আসবে।\",\"empty_requirements\":\"এখনও কোনো চাহিদা লেখা হয়নি — কথোপকথনে আপনি কী চান তা লিখুন, এজেন্ট এই নথিটির খসড়া তৈরি করবে।\",\"empty_tasks\":\"এখনও কোনো কাজের তালিকা নেই। ডিজাইন অনুমোদন করার পরে সাজানো কাজের তালিকা এখানে আসবে।\",\"nothing_here_yet\":\"এখানে এখনও কিছু নেই।\",\"your_feedback_on_the_passage_in\":\"{{document}}-এ নির্বাচিত অংশ সম্পর্কে তোমার মত\",\"your_feedback_on_this_passage_enter_adds_it_to_t\":\"এই অংশ সম্পর্কে আপনার মত… (Enter চাপলে তালিকায় যুক্ত হবে)\"},\"newSpecView\":{\"describe_what_you_want_to_do\":\"আপনি কী করতে চান তা লিখুন\",\"e_g_add_login_with_google_so_users_don_t_need_pa\":\"যেমন “Google দিয়ে লগইন যোগ করুন যাতে ব্যবহারকারীদের পাসওয়ার্ড লাগে না” বা “বড় ফাইলে এক্সপোর্ট বাটন ক্র্যাশ করে”\",\"fresh_worktree_option_pick_a_project_folder_abov\":\"নতুন worktree বিকল্প: উপরে একটি প্রকল্প ফোল্ডার বেছে নিন — এটি git রিপোজিটরি হলে আমি আলাদা worktree-তে পরিকল্পনা ও কাজ করতে পারি।\",\"keeps_your_main_checkout_untouched_branch\":\"তোমার মূল checkout অপরিবর্তিত থাকে: আমি রিপোজিটরির পাশে আলাদা ফোল্ডারে {{branch}} ব্রাঞ্চ তৈরি করব, এবং সেখানেই পরিকল্পনা ও কাজ করব।\",\"let_s_plan_something\":\"চলুন কিছু পরিকল্পনা করি\",\"never_mind\":\"বাতিল\",\"settings\":\"সেটিংস\",\"start_the_conversation\":\"কথা শুরু করো →\",\"starting\":\"শুরু হচ্ছে…\",\"tell_me_what_you_have_in_mind_i_ll_ask_a_few_cla\":\"আপনার ভাবনা জানান। আমি চ্যাটে কয়েকটি স্পষ্টীকরণ প্রশ্ন করব, আপনার পর্যালোচনার জন্য একটি পরিকল্পনা লিখব, তারপর আপনি প্রস্তুত হলে সেটি বানাব।\",\"this_folder_isn_t_a_git_repository_so_i_ll_work\":\"এই ফোল্ডারটি git রিপোজিটরি নয়, তাই আমি সরাসরি এর ভেতরেই কাজ করব। নতুন worktree-র বিকল্প পেতে একটি git রিপোজিটরি বেছে নিন।\",\"this_spec_will_be_called\":\"এই স্পেকের নাম হবে {{name}}\",\"type_bug_blurb\":\"সমস্যাটি খতিয়ে দেখুন, মূল কারণ খুঁজুন, এবং সমাধানের পরিকল্পনা করুন।\",\"type_bug_title\":\"একটি বাগ সারান\",\"type_feature_blurb\":\"সম্পূর্ণ পরিকল্পনা: চাহিদা, প্রযুক্তিগত ডিজাইন ও কাজের তালিকা।\",\"type_feature_title\":\"নতুন কিছু বানান\",\"type_quick_blurb\":\"আনুষ্ঠানিকতা বাদ — শুধু একটি লক্ষ্য ও কাজের তালিকা।\",\"type_quick_title\":\"দ্রুত পরিকল্পনা\",\"what_do_you_want_to_do\":\"আপনি কী করতে চান?\",\"what_kind_of_work_is_it\":\"এটি কোন ধরনের কাজ?\",\"which_project_is_this_for\":\"এটি কোন প্রকল্পের জন্য?\",\"work_in_a_fresh_worktree\":\"নতুন worktree-তে কাজ করুন\",\"your_plan_is_saved_as_plain_markdown_inside_your\":\"তোমার পরিকল্পনা প্রকল্পের ভিতরে সাধারণ markdown হিসেবে সংরক্ষিত হয় (.kiro/specs), তাই এটি Kiro IDE ও CLI-র সঙ্গেও কাজ করে। spec কোথায় রাখা হবে তা বদলাও\"},\"projectPicker\":{\"browse\":\"ব্রাউজ করো\",\"change\":\"পরিবর্তন\",\"choose_a_project_folder\":\"একটি প্রকল্প ফোল্ডার বেছে নিন…\",\"choose_a_project_folder_aria\":\"একটি প্রকল্প ফোল্ডার বেছে নাও\",\"go_to_parent_folder\":\"উপরের ফোল্ডারে যান\",\"hide_path_input\":\"পথ লেখার ঘর লুকাও\",\"home_you_projects_my_app\":\"/home/you/projects/my-app\",\"loading\":\"লোড হচ্ছে…\",\"no_subfolders_here_use_use_this_folder_above_to\":\"এখানে কোনো সাব-ফোল্ডার নেই — এটিকেই বেছে নিতে উপরের “এই ফোল্ডারটি ব্যবহার করুন” চাপুন।\",\"open_folder\":\"{{name}} ফোল্ডার খোলো\",\"project_folder_change\":\"প্রকল্প ফোল্ডার: {{path}} — বদলাও\",\"project_folder_path\":\"প্রকল্প ফোল্ডারের পথ\",\"recent_projects\":\"সাম্প্রতিক প্রকল্প\",\"type_a_path_instead\":\"বরং একটি পথ লেখো\",\"up\":\"উপরে\",\"use_recent_project\":\"সাম্প্রতিক প্রকল্প {{path}} ব্যবহার করো\",\"use_this_folder\":\"এই ফোল্ডারটি ব্যবহার করুন\",\"use_this_folder_path\":\"এই ফোল্ডারটি ব্যবহার করো: {{path}}\",\"load_failed\":\"এই ফোল্ডারের তালিকা আনা যায়নি\",\"load_failed_unknown\":\"কোনো কারণ ছাড়াই পড়া ব্যর্থ হয়েছে।\",\"retry\":\"আবার চেষ্টা করো\"},\"settingsModal\":{\"cancel\":\"বাতিল\",\"couldn_t_load_these_settings\":\"এই সেটিংস লোড করা যায়নি, তাই লোড না হওয়া পর্যন্ত সংরক্ষণ বন্ধ থাকবে।\",\"couldn_t_save_these_settings\":\"এই সেটিংস সংরক্ষণ করা যায়নি।\",\"default_keeps_the_model_your_chat_agent_resolves\":\"ডিফল্ট আপনার চ্যাট এজেন্ট যে মডেল নির্ধারণ করে সেটিই রাখে। বাছাই করা মডেল পরিবর্তনের পরে শুরু হওয়া spec সেশনে প্রযোজ্য হয় — চলমান spec তার বর্তমান মডেল রাখে।\",\"empty_keep_specs_with_each_project_recommended\":\"ফাঁকা = spec প্রতিটি প্রকল্পের সঙ্গেই রাখুন (প্রস্তাবিত)\",\"leave_this_empty_to_keep_specs_inside_each_proje\":\"spec প্রতিটি প্রকল্পের ভিতরে রাখতে এটি ফাঁকা রাখুন (আপনার কোডের পাশে .kiro/specs ফোল্ডার — Kiro-র আদর্শ)। অথবা সব spec এক জায়গায় জমা করতে একটি ফোল্ডার পথ দিন।\",\"model_default_inherit\":\"ডিফল্ট (উত্তরাধিকার)\",\"save\":\"সংরক্ষণ করো\",\"saving\":\"সংরক্ষণ হচ্ছে…\",\"settings\":\"সেটিংস\",\"spec_generation_model\":\"spec তৈরির মডেল\",\"spec_storage_folder_path\":\"spec সংরক্ষণ ফোল্ডারের পথ\",\"where_should_specs_be_saved\":\"spec কোথায় সংরক্ষণ করা হবে?\",\"which_model_should_run_spec_generation\":\"spec তৈরিতে কোন মডেল চলবে?\"},\"shimmer\":{\"loading_specs\":\"spec লোড হচ্ছে…\",\"loading_the_conversation\":\"কথোপকথন লোড হচ্ছে…\",\"writing_this_document\":\"এই নথিটি লেখা হচ্ছে…\"},\"specDetail\":{\"advance_to_design\":\"অনুমোদন → ডিজাইন\",\"advance_to_tasks\":\"অনুমোদন → কাজ\",\"an_agent_will_work_through_the_task_list\":\"একজন এজেন্ট কাজের তালিকা ধরে এগোবে\",\"approved\":\"অনুমোদিত\",\"approved_by_user\":\"{{user}} অনুমোদন করেছে\",\"archive_this_spec\":\"এই spec সংরক্ষণাগারে রাখো\",\"cancel\":\"বাতিল\",\"changed_since_approval\":\"অনুমোদনের পরে বদলেছে\",\"clear\":\"খালি করুন\",\"close_esc\":\"বন্ধ করুন (Esc)\",\"close_review_view\":\"পর্যালোচনা ভিউ বন্ধ করুন\",\"couldn_t_remove_this_spec_try_again\":\"এই স্পেক সরানো যায়নি — আবার চেষ্টা করুন।\",\"delete_spec_named\":\"স্পেক {{name}} সরান\",\"delete_this_spec\":\"এই স্পেক সরান\",\"document_file_name\":\"{{name}}.md\",\"drafting_design\":\"ডিজাইন লেখা হচ্ছে…\",\"drafting_tasks\":\"কাজ লেখা হচ্ছে…\",\"drag_or_use_to_resize\":\"আকার বদলাতে টানুন বা ← → ব্যবহার করুন\",\"duplicate_this_spec\":\"এই spec-এর নকল বানাও\",\"expand_document_for_review\":\"পর্যালোচনার জন্য নথি বড় করো\",\"expand_for_review_esc_to_close\":\"পর্যালোচনার জন্য বড় করো (Esc দিয়ে বন্ধ)\",\"name_for_the_copy\":\"নকলের নাম\",\"pause\":\"থামাও\",\"pausing\":\"থামানো হচ্ছে…\",\"pending_comment_one\":\"{{count}}টি অপেক্ষমাণ মন্তব্য\",\"pending_comment_other\":\"{{count}}টি অপেক্ষমাণ মন্তব্য\",\"remove_comment_on\":\"{{document}}-এর মন্তব্য সরাও\",\"remove_spec_body\":\"“{{name}}” Spec Builder থেকে চলে যাবে। মার্কডাউন ফাইলগুলো প্রকল্পে থাকবে, এবং এই স্পেকের যেকোনো চলমান এজেন্ট থামানো হবে।\",\"remove_this_spec\":\"এই স্পেক সরাবেন?\",\"removing\":\"সরানো হচ্ছে…\",\"rename_this_spec_label_the_folder_name_stays\":\"এই spec-এর লেবেল বদলাও। এর ফোল্ডার আর ব্রাঞ্চের নাম একই থাকবে।\",\"resize_document_panel\":\"নথি প্যানেলের আকার বদলান\",\"restore_this_spec\":\"এই spec ফিরিয়ে আনো\",\"review_document_named\":\"{{name}}-এর {{document}}.md পর্যালোচনা করুন\",\"send_all_to_agent\":\"সব এজেন্টকে পাঠান\",\"sending\":\"পাঠানো হচ্ছে…\",\"spec_label\":\"Spec-এর লেবেল\",\"start_building\":\"বানানো শুরু করো\",\"starting\":\"শুরু হচ্ছে…\",\"tab_design\":\"ডিজাইন\",\"tab_requirements\":\"চাহিদা\",\"tab_tasks\":\"কাজ\",\"tells_the_agent_this_phase_is_approved_and_to_mo\":\"এই সংস্করণে তোমার অনুমোদন লিখে রাখে, তারপর এজেন্টকে এগিয়ে যেতে বলে\",\"the_agent_is_writing_the_next_document\":\"অনুমোদিত — এজেন্ট পরবর্তী নথি লিখছে\",\"this_document_changed_after_it_was_approved\":\"এই নথিটি অনুমোদনের পরে বদলে গেছে\",\"working\":\"কাজ চলছে…\"},\"specRail\":{\"active\":\"সক্রিয়\",\"agent_working\":\"এজেন্ট কাজ করছে\",\"an_agent_is_working\":\"একজন এজেন্ট কাজ করছে\",\"filter_specs\":\"spec ফিল্টার করুন\",\"filter_specs_by_name\":\"নাম দিয়ে spec ফিল্টার করুন\",\"new_spec\":\"নতুন spec\",\"plan_ready\":\"পরিকল্পনা তৈরি\",\"settings\":\"সেটিংস\",\"show_spec_list\":\"spec তালিকা দেখান\",\"show_specs\":\"spec দেখান\",\"spec_builder\":\"Spec Builder\",\"spec_builder_settings\":\"Spec Builder সেটিংস\",\"specs\":\"SPECS\",\"v\":\"v\"},\"specStatePanel\":{\"answer_option\":\"“{{title}}”-এর উত্তর দিন {{option}} দিয়ে\",\"answer_option_recommended\":\"“{{title}}”-এর উত্তর দিন {{option}} দিয়ে (সুপারিশকৃত)\",\"answered\":\"উত্তর দেওয়া\",\"blocking\":\"প্রতিবন্ধক\",\"context\":\"প্রসঙ্গ\",\"decision_title\":\"সিদ্ধান্ত — {{title}}\",\"decisions\":\"সিদ্ধান্ত\",\"options_for\":\"{{title}}-এর বিকল্প\",\"pending\":\"মুলতুবি\",\"recommended\":\"প্রস্তাবিত\",\"sending\":\"পাঠানো হচ্ছে…\",\"template\":\"টেমপ্লেট\",\"tool_calls\":\"টুল কল\",\"turns\":\"পর্ব\",\"worktree\":\"Worktree\"},\"taskList\":{\"done\":\"সম্পন্ন\",\"no_tasks_yet\":\"এখনও কোনো কাজ নেই। ডিজাইন অনুমোদন করার পরে সাজানো কাজের তালিকা এখানে আসবে আর তুমি একটি একটি করে কাজ চালাতে পারবে।\",\"pause_the_build_first\":\"একটি কাজ চালানোর আগে বানানো থামাও\",\"run\":\"চালাও\",\"run_only_this_task_and_stop\":\"শুধু এই কাজটি চালাও, তারপর থামো\",\"run_task\":\"কাজ চালাও: {{task}}\",\"starting\":\"শুরু হচ্ছে…\",\"task_progress\":\"কাজের অগ্রগতি\",\"done_of_total_one\":\"{{total}}টির মধ্যে {{done}}টি কাজ সম্পন্ন\",\"done_of_total_other\":\"{{total}}টির মধ্যে {{done}}টি কাজ সম্পন্ন\"},\"workspace\":{\"describe_what_you_want_to_build_answer_a_few_que\":\"আপনি কী বানাতে চান তা লিখুন, কয়েকটি প্রশ্নের উত্তর দিন, এবং একটি পর্যালোচিত পরিকল্পনা পান — চাহিদা, ডিজাইন ও কাজ — যা একজন এজেন্ট সম্পন্ন করতে পারে।\",\"pick_a_spec_to_continue_where_you_left_off\":\"যেখানে থেমেছিলেন সেখান থেকে চালিয়ে যেতে একটি spec বেছে নিন\",\"plan_your_next_feature_with_a_spec\":\"spec দিয়ে আপনার পরবর্তী ফিচারের পরিকল্পনা করুন\",\"resize_spec_list\":\"spec তালিকার আকার বদলান\",\"start_your_first_spec\":\"আপনার প্রথম spec তৈরি করুন\"}},\"manifest\":{\"description\":\"Kiro Crew-এর ভিতরে spec-নির্ভর ডেভেলপমেন্ট: অন্তর্নির্মিত একজন এজেন্টের সঙ্গে মিলে একটি ফিচারের ভাবনাকে চাহিদা → ডিজাইন → কাজ — এই তিন ধাপে রূপ দাও, অ্যাপেই markdown পর্যালোচনা করো, তারপর অনুমোদিত পরিকল্পনাটি একটি স্বায়ত্তশাসিত এক্সিকিউশন সেশনের হাতে তুলে দাও।\",\"display_name\":\"Spec Builder\",\"use_case_1\":\"feature, bug বা ছোট task-কে পর্যালোচনাযোগ্য, repository-aware requirement, design ও implementation step-এ রূপ দিন।\",\"configuration_1\":\"project folder ও Feature, Bug বা Quick mode বেছে নিন, চাইলে নতুন worktree তৈরি করুন, তারপর build শুরুর আগে তৈরি প্রতিটি stage পর্যালোচনা ও অনুমোদন করুন।\",\"page_label\":\"Spec Builder\"},\"specBuilderPage\":{\"spec_builder\":\"Spec Builder\",\"talk_through_an_idea_review_the_plan_then_let_an\":\"একটি ভাবনা নিয়ে আলোচনা করুন, পরিকল্পনা পর্যালোচনা করুন, তারপর একজন এজেন্টকে দিয়ে তা বানান।\"}},\"issueRadar\":{\"components\":{\"detailOverflowMenu\":{\"more_actions\":\"আরও অ্যাকশন\"}}},\"meetings\":{\"review\":{\"archivedSection\":\"সংরক্ষণাগারে\"}}}"),
		components: {
			"ui": {
				"no_noun_match": "কোনো {{noun}} মিলছে না",
				"no_matches_for": "কোনো মিল নেই",
				"clear_filter": "ফিল্টার মুছুন"
			},
			"resizeHandle": { "drag_to_resize": "আকার বদলাতে টানুন" }
		}
	},
	de: {
		apps: /* @__PURE__ */ JSON.parse("{\"specBuilder\":{\"api\":{\"phase_building\":\"wird umgesetzt\",\"phase_design\":\"design\",\"phase_new\":\"gerade gestartet\",\"phase_ready\":\"fertig\",\"phase_requirements\":\"anforderungen\",\"phase_tasks\":\"plan fertig\",\"something_went_wrong\":\"Etwas ist schiefgelaufen ({{status}})\"},\"components\":{\"chatColumn\":{\"reply_to_the_spec_agent\":\"Dem Spec-Agenten antworten…\"},\"columnSplitter\":{\"drag_or_use_to_resize\":\"Ziehen oder ← → verwenden, um die Größe zu ändern\"},\"docView\":{\"add_comment\":\"Kommentar hinzufügen\",\"comment\":\"Kommentieren\",\"comment_on_the_selected_passage\":\"Die markierte Passage kommentieren\",\"discard_this_comment\":\"Diesen Kommentar verwerfen\",\"document_file_name\":\"{{name}}.md\",\"empty_design\":\"Noch kein Design. Sobald Sie die Anforderungen in der Unterhaltung freigeben, landet das technische Design hier.\",\"empty_requirements\":\"Noch keine Anforderungen geschrieben — beschreiben Sie in der Unterhaltung, was Sie möchten, und der Agent entwirft dieses Dokument.\",\"empty_tasks\":\"Noch keine Aufgabenliste. Nachdem Sie das Design freigegeben haben, landet die geordnete Aufgabenliste hier.\",\"nothing_here_yet\":\"Hier ist noch nichts.\",\"your_feedback_on_the_passage_in\":\"Ihr Feedback zur markierten Passage in {{document}}\",\"your_feedback_on_this_passage_enter_adds_it_to_t\":\"Ihr Feedback zu dieser Passage… (Enter fügt es dem Stapel hinzu)\"},\"newSpecView\":{\"describe_what_you_want_to_do\":\"Beschreiben Sie, was Sie vorhaben\",\"e_g_add_login_with_google_so_users_don_t_need_pa\":\"z. B. „Login mit Google hinzufügen, damit Nutzer keine Passwörter brauchen“ oder „Der Export-Button stürzt bei großen Dateien ab“\",\"fresh_worktree_option_pick_a_project_folder_abov\":\"Option für ein frisches Worktree: Wählen Sie oben einen Projektordner — wenn es ein Git-Repository ist, kann ich in einem eigenen Worktree planen und bauen.\",\"keeps_your_main_checkout_untouched_branch\":\"Lässt Ihren Haupt-Checkout unberührt: Ich erstelle einen Branch {{branch}} in einem eigenen Ordner neben dem Repository und plane und baue dort.\",\"let_s_plan_something\":\"Planen wir etwas\",\"never_mind\":\"Abbrechen\",\"settings\":\"Einstellungen\",\"start_the_conversation\":\"Unterhaltung beginnen →\",\"starting\":\"Wird gestartet…\",\"tell_me_what_you_have_in_mind_i_ll_ask_a_few_cla\":\"Sagen Sie mir, was Sie vorhaben. Ich stelle im Chat einige klärende Fragen, schreibe einen Plan, den Sie prüfen können, und baue ihn dann, wenn Sie bereit sind.\",\"this_folder_isn_t_a_git_repository_so_i_ll_work\":\"Dieser Ordner ist kein Git-Repository, daher arbeite ich direkt darin. Wählen Sie ein Git-Repository, um die Option eines frischen Worktrees zu erhalten.\",\"this_spec_will_be_called\":\"Diese Spezifikation heißt {{name}}\",\"type_bug_blurb\":\"Das Problem untersuchen, die Ursache finden und die Behebung planen.\",\"type_bug_title\":\"Einen Fehler beheben\",\"type_feature_blurb\":\"Ein vollständiger Plan: Anforderungen, technisches Design und eine Aufgabenliste.\",\"type_feature_title\":\"Etwas Neues bauen\",\"type_quick_blurb\":\"Ohne Formalitäten — nur ein Ziel und eine Aufgabenliste.\",\"type_quick_title\":\"Schneller Plan\",\"what_do_you_want_to_do\":\"Was möchten Sie tun?\",\"what_kind_of_work_is_it\":\"Um welche Art von Arbeit handelt es sich?\",\"which_project_is_this_for\":\"Für welches Projekt ist das?\",\"work_in_a_fresh_worktree\":\"In einem frischen Worktree arbeiten\",\"your_plan_is_saved_as_plain_markdown_inside_your\":\"Ihr Plan wird als einfaches Markdown in Ihrem Projekt gespeichert (.kiro/specs) und funktioniert damit auch mit der Kiro IDE und der CLI. Wo Specs gespeichert werden, ändern Sie unter\"},\"projectPicker\":{\"browse\":\"Durchsuchen\",\"change\":\"ändern\",\"choose_a_project_folder\":\"Projektordner auswählen…\",\"choose_a_project_folder_aria\":\"Projektordner auswählen\",\"go_to_parent_folder\":\"Zum übergeordneten Ordner\",\"hide_path_input\":\"Pfadeingabe ausblenden\",\"home_you_projects_my_app\":\"/home/you/projects/my-app\",\"loading\":\"Wird geladen…\",\"no_subfolders_here_use_use_this_folder_above_to\":\"Keine Unterordner hier — verwenden Sie oben „Diesen Ordner verwenden“, um diesen zu wählen.\",\"open_folder\":\"Ordner {{name}} öffnen\",\"project_folder_change\":\"Projektordner: {{path}} — ändern\",\"project_folder_path\":\"Pfad des Projektordners\",\"recent_projects\":\"Zuletzt verwendete Projekte\",\"type_a_path_instead\":\"Stattdessen einen Pfad eingeben\",\"up\":\"Nach oben\",\"use_recent_project\":\"Zuletzt verwendetes Projekt {{path}} verwenden\",\"use_this_folder\":\"Diesen Ordner verwenden\",\"use_this_folder_path\":\"Diesen Ordner verwenden: {{path}}\",\"load_failed\":\"Dieser Ordner konnte nicht aufgelistet werden\",\"load_failed_unknown\":\"Das Lesen ist ohne Angabe eines Grundes fehlgeschlagen.\",\"retry\":\"Erneut versuchen\"},\"settingsModal\":{\"cancel\":\"Abbrechen\",\"couldn_t_load_these_settings\":\"Diese Einstellungen konnten nicht geladen werden – Speichern ist erst möglich, wenn sie geladen sind.\",\"couldn_t_save_these_settings\":\"Diese Einstellungen konnten nicht gespeichert werden.\",\"default_keeps_the_model_your_chat_agent_resolves\":\"Standard übernimmt das Modell, das dein Chat-Agent ohnehin auflöst. Eine Auswahl gilt für Spec-Sitzungen, die nach der Änderung starten — eine bereits laufende Spec behält ihr aktuelles Modell.\",\"empty_keep_specs_with_each_project_recommended\":\"Leer = Specs beim jeweiligen Projekt behalten (empfohlen)\",\"leave_this_empty_to_keep_specs_inside_each_proje\":\"Lassen Sie dies leer, um Specs in jedem Projekt zu behalten (ein Ordner .kiro/specs neben Ihrem Code — der Kiro-Standard). Oder geben Sie einen Ordnerpfad an, um alle Specs an einem Ort zu sammeln.\",\"model_default_inherit\":\"Standard (übernehmen)\",\"save\":\"Speichern\",\"saving\":\"Wird gespeichert…\",\"settings\":\"Einstellungen\",\"spec_generation_model\":\"Modell für die Spec-Erstellung\",\"spec_storage_folder_path\":\"Ordnerpfad für die Spec-Ablage\",\"where_should_specs_be_saved\":\"Wo sollen Specs gespeichert werden?\",\"which_model_should_run_spec_generation\":\"Welches Modell soll die Spec-Erstellung ausführen?\"},\"shimmer\":{\"loading_specs\":\"Specs werden geladen…\",\"loading_the_conversation\":\"Unterhaltung wird geladen…\",\"writing_this_document\":\"Dieses Dokument wird geschrieben…\"},\"specDetail\":{\"advance_to_design\":\"Freigeben → Design\",\"advance_to_tasks\":\"Freigeben → Aufgaben\",\"an_agent_will_work_through_the_task_list\":\"Ein Agent arbeitet die Aufgabenliste ab\",\"approved\":\"Freigegeben\",\"approved_by_user\":\"Freigegeben von {{user}}\",\"archive_this_spec\":\"Diese Spec archivieren\",\"cancel\":\"Abbrechen\",\"changed_since_approval\":\"Seit der Freigabe geändert\",\"clear\":\"Leeren\",\"close_esc\":\"Schließen (Esc)\",\"close_review_view\":\"Prüfansicht schließen\",\"couldn_t_remove_this_spec_try_again\":\"Diese Spezifikation konnte nicht entfernt werden – bitte erneut versuchen.\",\"delete_spec_named\":\"Spezifikation {{name}} entfernen\",\"delete_this_spec\":\"Diese Spezifikation entfernen\",\"document_file_name\":\"{{name}}.md\",\"drafting_design\":\"Design wird erstellt…\",\"drafting_tasks\":\"Aufgaben werden erstellt…\",\"drag_or_use_to_resize\":\"Ziehen oder ← → verwenden, um die Größe zu ändern\",\"duplicate_this_spec\":\"Diese Spec duplizieren\",\"expand_document_for_review\":\"Dokument zur Prüfung vergrößern\",\"expand_for_review_esc_to_close\":\"Zur Prüfung vergrößern (Esc schließt)\",\"name_for_the_copy\":\"Name für die Kopie\",\"pause\":\"Pausieren\",\"pausing\":\"Wird pausiert…\",\"pending_comment_one\":\"{{count}} offener Kommentar\",\"pending_comment_other\":\"{{count}} offene Kommentare\",\"remove_comment_on\":\"Kommentar zu {{document}} entfernen\",\"remove_spec_body\":\"„{{name}}“ verlässt Spec Builder. Die Markdown-Dateien bleiben im Projekt, und jeder laufende Agent für diese Spezifikation wird gestoppt.\",\"remove_this_spec\":\"Diese Spezifikation entfernen?\",\"removing\":\"Wird entfernt…\",\"rename_this_spec_label_the_folder_name_stays\":\"Benenne die Bezeichnung dieser Spec um. Ordner- und Branch-Name bleiben gleich.\",\"resize_document_panel\":\"Größe des Dokumentbereichs ändern\",\"restore_this_spec\":\"Diese Spec wiederherstellen\",\"review_document_named\":\"{{document}}.md für {{name}} prüfen\",\"send_all_to_agent\":\"Alle an den Agenten senden\",\"sending\":\"Wird gesendet…\",\"spec_label\":\"Spec-Bezeichnung\",\"start_building\":\"Umsetzung starten\",\"starting\":\"Wird gestartet…\",\"tab_design\":\"Design\",\"tab_requirements\":\"Anforderungen\",\"tab_tasks\":\"Aufgaben\",\"tells_the_agent_this_phase_is_approved_and_to_mo\":\"Hält deine Freigabe dieser Version fest und sagt dem Agenten dann, dass er weitermachen soll\",\"the_agent_is_writing_the_next_document\":\"Genehmigt — der Agent schreibt das nächste Dokument\",\"this_document_changed_after_it_was_approved\":\"Dieses Dokument hat sich nach der Freigabe geändert\",\"working\":\"arbeitet…\"},\"specRail\":{\"active\":\"AKTIV\",\"agent_working\":\"Agent arbeitet\",\"an_agent_is_working\":\"Ein Agent arbeitet\",\"filter_specs\":\"Specs filtern\",\"filter_specs_by_name\":\"Specs nach Namen filtern\",\"new_spec\":\"Neue Spec\",\"plan_ready\":\"PLAN FERTIG\",\"settings\":\"Einstellungen\",\"show_spec_list\":\"Spec-Liste anzeigen\",\"show_specs\":\"Specs anzeigen\",\"spec_builder\":\"Spec Builder\",\"spec_builder_settings\":\"Spec Builder-Einstellungen\",\"specs\":\"SPECS\",\"v\":\"v\"},\"specStatePanel\":{\"answer_option\":\"„{{title}}“ mit {{option}} beantworten\",\"answer_option_recommended\":\"„{{title}}“ mit {{option}} beantworten (empfohlen)\",\"answered\":\"beantwortet\",\"blocking\":\"BLOCKIEREND\",\"context\":\"KONTEXT\",\"decision_title\":\"Entscheidung — {{title}}\",\"decisions\":\"ENTSCHEIDUNGEN\",\"options_for\":\"Optionen für {{title}}\",\"pending\":\"offen\",\"recommended\":\"EMPFOHLEN\",\"sending\":\"wird gesendet…\",\"template\":\"Vorlage\",\"tool_calls\":\"Tool-Aufrufe\",\"turns\":\"Runden\",\"worktree\":\"Worktree\"},\"taskList\":{\"done\":\"Fertig\",\"no_tasks_yet\":\"Noch keine Aufgaben. Sobald das Design freigegeben ist, landet die geordnete Aufgabenliste hier und du kannst Aufgaben einzeln ausführen.\",\"pause_the_build_first\":\"Pausiere die Umsetzung, bevor du eine einzelne Aufgabe ausführst\",\"run\":\"Ausführen\",\"run_only_this_task_and_stop\":\"Nur diese Aufgabe ausführen und dann anhalten\",\"run_task\":\"Aufgabe ausführen: {{task}}\",\"starting\":\"Wird gestartet…\",\"task_progress\":\"Aufgabenfortschritt\",\"done_of_total_one\":\"{{done}} von {{total}} Aufgabe fertig\",\"done_of_total_other\":\"{{done}} von {{total}} Aufgaben fertig\"},\"workspace\":{\"describe_what_you_want_to_build_answer_a_few_que\":\"Beschreiben Sie, was Sie bauen möchten, beantworten Sie einige Fragen und erhalten Sie einen geprüften Plan — Anforderungen, Design und Aufgaben — den ein Agent umsetzen kann.\",\"pick_a_spec_to_continue_where_you_left_off\":\"Wählen Sie eine Spec, um dort weiterzumachen, wo Sie aufgehört haben\",\"plan_your_next_feature_with_a_spec\":\"Planen Sie Ihr nächstes Feature mit einer Spec\",\"resize_spec_list\":\"Größe der Spec-Liste ändern\",\"start_your_first_spec\":\"Erstellen Sie Ihre erste Spec\"}},\"manifest\":{\"description\":\"Spec-getriebene Entwicklung in Kiro Crew: Verwandle eine Feature-Idee mit einem eingebetteten Agenten in Anforderungen → Design → Aufgaben, prüfe das Markdown direkt in der App und übergib den freigegebenen Plan dann an eine autonome Ausführungssitzung.\",\"display_name\":\"Spec Builder\",\"page_label\":\"Spec Builder\",\"use_case_1\":\"Verwandle ein Feature, einen Fehler oder eine kurze Aufgabe in überprüfbare, Repository-bezogene Anforderungen, ein Design und Umsetzungsschritte.\",\"configuration_1\":\"Wähle einen Projektordner und den Modus Feature, Bug oder Quick, erstelle optional einen neuen Worktree und prüfe und genehmige dann jede erzeugte Phase, bevor du den Build startest.\"},\"specBuilderPage\":{\"spec_builder\":\"Spec Builder\",\"talk_through_an_idea_review_the_plan_then_let_an\":\"Besprechen Sie eine Idee, prüfen Sie den Plan und lassen Sie dann einen Agenten sie umsetzen.\"}},\"issueRadar\":{\"components\":{\"detailOverflowMenu\":{\"more_actions\":\"Weitere Aktionen\"}}},\"meetings\":{\"review\":{\"archivedSection\":\"Archiviert\"}}}"),
		components: {
			"ui": {
				"no_noun_match": "Keine passenden {{noun}}",
				"no_matches_for": "Keine Treffer für",
				"clear_filter": "Filter löschen"
			},
			"resizeHandle": { "drag_to_resize": "Ziehen zum Ändern der Größe" }
		}
	},
	en: {
		apps: /* @__PURE__ */ JSON.parse("{\"specBuilder\":{\"api\":{\"phase_building\":\"building\",\"phase_design\":\"design\",\"phase_new\":\"just started\",\"phase_ready\":\"ready\",\"phase_requirements\":\"requirements\",\"phase_tasks\":\"plan ready\",\"something_went_wrong\":\"Something went wrong ({{status}})\"},\"components\":{\"chatColumn\":{\"reply_to_the_spec_agent\":\"Reply to the Spec agent…\"},\"columnSplitter\":{\"drag_or_use_to_resize\":\"Drag or use ← → to resize\"},\"docView\":{\"add_comment\":\"Add comment\",\"comment\":\"Comment\",\"comment_on_the_selected_passage\":\"Comment on the selected passage\",\"discard_this_comment\":\"Discard this comment\",\"document_file_name\":\"{{name}}.md\",\"empty_design\":\"No design yet. Once you approve the requirements in the conversation, the technical design lands here.\",\"empty_requirements\":\"No requirements written yet — describe what you want in the conversation and the agent will draft this document.\",\"empty_tasks\":\"No task list yet. After you approve the design, the ordered task list lands here.\",\"nothing_here_yet\":\"Nothing here yet.\",\"your_feedback_on_the_passage_in\":\"Your feedback on the selected passage in {{document}}\",\"your_feedback_on_this_passage_enter_adds_it_to_t\":\"Your feedback on this passage… (Enter adds it to the stack)\"},\"newSpecView\":{\"describe_what_you_want_to_do\":\"Describe what you want to do\",\"e_g_add_login_with_google_so_users_don_t_need_pa\":\"e.g. “Add login with Google so users don’t need passwords” or “The export button crashes on large files”\",\"fresh_worktree_option_pick_a_project_folder_abov\":\"Fresh-worktree option: pick a project folder above — if it’s a git repository, I can plan and build in a dedicated worktree so your main checkout stays untouched.\",\"keeps_your_main_checkout_untouched_branch\":\"Keeps your main checkout untouched: I'll create a branch {{branch}} in its own folder next to the repo, and plan + build there.\",\"let_s_plan_something\":\"Let’s plan something\",\"never_mind\":\"Never mind\",\"settings\":\"Settings\",\"start_the_conversation\":\"Start the conversation →\",\"starting\":\"Starting…\",\"tell_me_what_you_have_in_mind_i_ll_ask_a_few_cla\":\"Tell me what you have in mind. I’ll ask a few clarifying questions in chat, write up a plan you can review, and\\n          then build it when you’re ready.\",\"this_folder_isn_t_a_git_repository_so_i_ll_work\":\"This folder isn’t a git repository, so I’ll work in it directly. Pick a git repo to get the option of a fresh worktree (keeps your main checkout untouched).\",\"this_spec_will_be_called\":\"This spec will be called {{name}}\",\"type_bug_blurb\":\"Investigate the problem, find the root cause, and plan the fix.\",\"type_bug_title\":\"Fix a bug\",\"type_feature_blurb\":\"A full plan: requirements, technical design, and a task list.\",\"type_feature_title\":\"Build something new\",\"type_quick_blurb\":\"Skip the formality — just a goal and a task list.\",\"type_quick_title\":\"Quick plan\",\"what_do_you_want_to_do\":\"What do you want to do?\",\"what_kind_of_work_is_it\":\"What kind of work is it?\",\"which_project_is_this_for\":\"Which project is this for?\",\"work_in_a_fresh_worktree\":\"Work in a fresh worktree\",\"your_plan_is_saved_as_plain_markdown_inside_your\":\"Your plan is saved as plain markdown inside your project (.kiro/specs), so it also works with the Kiro IDE and CLI. You can change where specs are stored in\"},\"projectPicker\":{\"browse\":\"Browse\",\"change\":\"change\",\"choose_a_project_folder\":\"Choose a project folder…\",\"choose_a_project_folder_aria\":\"Choose a project folder\",\"go_to_parent_folder\":\"Go to parent folder\",\"hide_path_input\":\"Hide the path input\",\"home_you_projects_my_app\":\"/home/you/projects/my-app\",\"loading\":\"Loading…\",\"no_subfolders_here_use_use_this_folder_above_to\":\"No subfolders here — use “Use this folder” above to pick this one.\",\"open_folder\":\"Open folder {{name}}\",\"project_folder_change\":\"Project folder: {{path}} — change\",\"project_folder_path\":\"Project folder path\",\"recent_projects\":\"Recent projects\",\"type_a_path_instead\":\"Type a path instead\",\"up\":\"Up\",\"use_recent_project\":\"Use recent project {{path}}\",\"use_this_folder\":\"Use this folder\",\"use_this_folder_path\":\"Use this folder: {{path}}\",\"load_failed\":\"Could not list this folder\",\"load_failed_unknown\":\"The read failed without a reason.\",\"retry\":\"Retry\"},\"settingsModal\":{\"cancel\":\"Cancel\",\"couldn_t_load_these_settings\":\"Couldn’t load these settings, so saving is off until they load.\",\"couldn_t_save_these_settings\":\"Couldn’t save these settings.\",\"default_keeps_the_model_your_chat_agent_resolves\":\"Default keeps whatever model your chat agent already resolves to. A pick applies to spec sessions that start after the change — a spec already in progress keeps its current model.\",\"empty_keep_specs_with_each_project_recommended\":\"Empty = keep specs with each project (recommended)\",\"leave_this_empty_to_keep_specs_inside_each_proje\":\"Leave this empty to keep specs inside each project (a .kiro/specs folder next to your code — the Kiro standard).\\n        Or set a folder path to collect all specs in one place instead.\",\"model_default_inherit\":\"Default (inherit)\",\"save\":\"Save\",\"saving\":\"Saving…\",\"settings\":\"Settings\",\"spec_generation_model\":\"Spec generation model\",\"spec_storage_folder_path\":\"Spec storage folder path\",\"where_should_specs_be_saved\":\"Where should specs be saved?\",\"which_model_should_run_spec_generation\":\"Which model should run spec generation?\"},\"shimmer\":{\"loading_specs\":\"Loading specs…\",\"loading_the_conversation\":\"Loading the conversation…\",\"writing_this_document\":\"Writing this document…\"},\"specDetail\":{\"advance_to_design\":\"Approve → Design\",\"advance_to_tasks\":\"Approve → Tasks\",\"an_agent_will_work_through_the_task_list\":\"An agent will work through the task list\",\"approved\":\"Approved\",\"approved_by_user\":\"Approved by {{user}}\",\"archive_this_spec\":\"Archive this spec\",\"cancel\":\"Cancel\",\"changed_since_approval\":\"Changed since approval\",\"clear\":\"Clear\",\"close_esc\":\"Close (Esc)\",\"close_review_view\":\"Close review view\",\"couldn_t_remove_this_spec_try_again\":\"Couldn’t remove this spec — try again.\",\"delete_spec_named\":\"Remove spec {{name}}\",\"delete_this_spec\":\"Remove this spec\",\"document_file_name\":\"{{name}}.md\",\"drafting_design\":\"Drafting design…\",\"drafting_tasks\":\"Drafting tasks…\",\"drag_or_use_to_resize\":\"Drag or use ← → to resize\",\"duplicate_this_spec\":\"Duplicate this spec\",\"expand_document_for_review\":\"Expand document for review\",\"expand_for_review_esc_to_close\":\"Expand for review (Esc to close)\",\"name_for_the_copy\":\"Name for the copy\",\"pause\":\"Pause\",\"pausing\":\"Pausing…\",\"pending_comment_one\":\"{{count}} pending comment\",\"pending_comment_other\":\"{{count}} pending comments\",\"remove_comment_on\":\"Remove comment on {{document}}\",\"remove_spec_body\":\"“{{name}}” will leave Spec Builder. The markdown files stay in the project, and any running agent for this spec will be stopped.\",\"remove_this_spec\":\"Remove this spec?\",\"removing\":\"Removing…\",\"rename_this_spec_label_the_folder_name_stays\":\"Rename this spec’s label. Its folder and branch name stay the same.\",\"resize_document_panel\":\"Resize document panel\",\"restore_this_spec\":\"Restore this spec\",\"review_document_named\":\"Review {{document}}.md for {{name}}\",\"send_all_to_agent\":\"Send all to agent\",\"sending\":\"Sending…\",\"spec_label\":\"Spec label\",\"start_building\":\"Start building\",\"starting\":\"Starting…\",\"tab_design\":\"Design\",\"tab_requirements\":\"Requirements\",\"tab_tasks\":\"Tasks\",\"tells_the_agent_this_phase_is_approved_and_to_mo\":\"Records your approval of this version, then tells the agent to move on\",\"the_agent_is_writing_the_next_document\":\"Approved — the agent is writing the next document\",\"this_document_changed_after_it_was_approved\":\"This document changed after it was approved\",\"working\":\"working…\"},\"specRail\":{\"active\":\"ACTIVE\",\"agent_working\":\"agent working\",\"an_agent_is_working\":\"An agent is working\",\"filter_specs\":\"Filter specs\",\"filter_specs_by_name\":\"Filter specs by name\",\"new_spec\":\"New spec\",\"plan_ready\":\"PLAN READY\",\"settings\":\"Settings\",\"show_spec_list\":\"Show spec list\",\"show_specs\":\"Show specs\",\"spec_builder\":\"Spec Builder\",\"spec_builder_settings\":\"Spec Builder settings\",\"specs\":\"SPECS\",\"v\":\"v\"},\"specStatePanel\":{\"answer_option\":\"Answer “{{title}}” with {{option}}\",\"answer_option_recommended\":\"Answer “{{title}}” with {{option}} (recommended)\",\"answered\":\"answered\",\"blocking\":\"BLOCKING\",\"context\":\"CONTEXT\",\"decision_title\":\"Decision — {{title}}\",\"decisions\":\"DECISIONS\",\"options_for\":\"Options for {{title}}\",\"pending\":\"pending\",\"recommended\":\"RECOMMENDED\",\"sending\":\"sending…\",\"template\":\"Template\",\"tool_calls\":\"Tool calls\",\"turns\":\"Turns\",\"worktree\":\"Worktree\"},\"taskList\":{\"done\":\"Done\",\"no_tasks_yet\":\"No tasks yet. Once the design is approved, the ordered task list lands here and you can run tasks one at a time.\",\"pause_the_build_first\":\"Pause the build before running a single task\",\"run\":\"Run\",\"run_only_this_task_and_stop\":\"Run only this task, then stop\",\"run_task\":\"Run task: {{task}}\",\"starting\":\"Starting…\",\"task_progress\":\"Task progress\",\"done_of_total_one\":\"{{done}} of {{total}} task done\",\"done_of_total_other\":\"{{done}} of {{total}} tasks done\"},\"workspace\":{\"describe_what_you_want_to_build_answer_a_few_que\":\"Describe what you want to build, answer a few questions, and get a reviewed plan — requirements, design, and tasks — that an agent can execute for you.\",\"pick_a_spec_to_continue_where_you_left_off\":\"Pick a spec to continue where you left off\",\"plan_your_next_feature_with_a_spec\":\"Plan your next feature with a spec\",\"resize_spec_list\":\"Resize spec list\",\"start_your_first_spec\":\"Start your first spec\"}},\"manifest\":{\"description\":\"Spec-driven development inside Kiro Crew: turn a feature idea into Requirements → Design → Tasks with an embedded agent, review the markdown in-app, then hand the approved plan off to an autonomous execution session.\",\"display_name\":\"Spec Builder\",\"page_label\":\"Spec Builder\",\"use_case_1\":\"Turn a feature, bug, or quick task into reviewable repository-aware requirements, design, and implementation steps.\",\"configuration_1\":\"Choose a project folder and Feature, Bug, or Quick mode, optionally create a fresh worktree, then review and approve each generated stage before starting the build.\"},\"specBuilderPage\":{\"spec_builder\":\"Spec Builder\",\"talk_through_an_idea_review_the_plan_then_let_an\":\"Talk through an idea, review the plan, then let an agent build it.\"}},\"issueRadar\":{\"components\":{\"detailOverflowMenu\":{\"more_actions\":\"More actions\"}}},\"meetings\":{\"review\":{\"archivedSection\":\"Archived\"}}}"),
		components: {
			"ui": {
				"no_noun_match": "No {{noun}} match",
				"no_matches_for": "No matches for",
				"clear_filter": "Clear filter"
			},
			"resizeHandle": { "drag_to_resize": "Drag to resize" }
		}
	},
	es: {
		apps: /* @__PURE__ */ JSON.parse("{\"specBuilder\":{\"api\":{\"phase_building\":\"construyendo\",\"phase_design\":\"diseño\",\"phase_new\":\"recién empezada\",\"phase_ready\":\"lista\",\"phase_requirements\":\"requisitos\",\"phase_tasks\":\"plan listo\",\"something_went_wrong\":\"Algo salió mal ({{status}})\"},\"components\":{\"chatColumn\":{\"reply_to_the_spec_agent\":\"Responder al agente de Spec…\"},\"columnSplitter\":{\"drag_or_use_to_resize\":\"Arrastra o usa ← → para redimensionar\"},\"docView\":{\"add_comment\":\"Añadir comentario\",\"comment\":\"Comentar\",\"comment_on_the_selected_passage\":\"Comentar el fragmento seleccionado\",\"discard_this_comment\":\"Descartar este comentario\",\"document_file_name\":\"{{name}}.md\",\"empty_design\":\"Todavía no hay diseño. Cuando apruebes los requisitos en la conversación, el diseño técnico aparecerá aquí.\",\"empty_requirements\":\"Aún no hay requisitos escritos — describe lo que quieres en la conversación y el agente redactará este documento.\",\"empty_tasks\":\"Todavía no hay lista de tareas. Cuando apruebes el diseño, la lista ordenada de tareas aparecerá aquí.\",\"nothing_here_yet\":\"Aquí todavía no hay nada.\",\"your_feedback_on_the_passage_in\":\"Tus comentarios sobre el fragmento seleccionado en {{document}}\",\"your_feedback_on_this_passage_enter_adds_it_to_t\":\"Tus comentarios sobre este fragmento… (Enter lo añade a la pila)\"},\"newSpecView\":{\"describe_what_you_want_to_do\":\"Describe lo que quieres hacer\",\"e_g_add_login_with_google_so_users_don_t_need_pa\":\"p. ej. «Añadir inicio de sesión con Google para que no hagan falta contraseñas» o «El botón de exportar falla con archivos grandes»\",\"fresh_worktree_option_pick_a_project_folder_abov\":\"Opción de worktree nuevo: elige arriba una carpeta de proyecto — si es un repositorio git, puedo planificar y construir en un worktree propio.\",\"keeps_your_main_checkout_untouched_branch\":\"Deja intacto tu checkout principal: crearé una rama {{branch}} en su propia carpeta junto al repositorio, y planificaré y construiré allí.\",\"let_s_plan_something\":\"Planifiquemos algo\",\"never_mind\":\"Cancelar\",\"settings\":\"Ajustes\",\"start_the_conversation\":\"Iniciar la conversación →\",\"starting\":\"Iniciando…\",\"tell_me_what_you_have_in_mind_i_ll_ask_a_few_cla\":\"Cuéntame qué tienes en mente. Te haré algunas preguntas para aclarar en el chat, escribiré un plan que puedas revisar y luego lo construiré cuando estés listo.\",\"this_folder_isn_t_a_git_repository_so_i_ll_work\":\"Esta carpeta no es un repositorio git, así que trabajaré directamente en ella. Elige un repositorio git para tener la opción de un worktree nuevo.\",\"this_spec_will_be_called\":\"Esta especificación se llamará {{name}}\",\"type_bug_blurb\":\"Investigar el problema, encontrar la causa raíz y planificar la solución.\",\"type_bug_title\":\"Corregir un error\",\"type_feature_blurb\":\"Un plan completo: requisitos, diseño técnico y una lista de tareas.\",\"type_feature_title\":\"Construir algo nuevo\",\"type_quick_blurb\":\"Sin formalidades — solo un objetivo y una lista de tareas.\",\"type_quick_title\":\"Plan rápido\",\"what_do_you_want_to_do\":\"¿Qué quieres hacer?\",\"what_kind_of_work_is_it\":\"¿Qué tipo de trabajo es?\",\"which_project_is_this_for\":\"¿Para qué proyecto es?\",\"work_in_a_fresh_worktree\":\"Trabajar en un worktree nuevo\",\"your_plan_is_saved_as_plain_markdown_inside_your\":\"Tu plan se guarda como markdown sencillo dentro de tu proyecto (.kiro/specs), así que también funciona con el IDE Kiro y la CLI. Puedes cambiar dónde se guardan las specs en\"},\"projectPicker\":{\"browse\":\"Explorar\",\"change\":\"cambiar\",\"choose_a_project_folder\":\"Elegir una carpeta de proyecto…\",\"choose_a_project_folder_aria\":\"Elegir una carpeta de proyecto\",\"go_to_parent_folder\":\"Ir a la carpeta superior\",\"hide_path_input\":\"Ocultar el campo de ruta\",\"home_you_projects_my_app\":\"/home/you/projects/my-app\",\"loading\":\"Cargando…\",\"no_subfolders_here_use_use_this_folder_above_to\":\"Aquí no hay subcarpetas: usa «Usar esta carpeta» arriba para elegir esta.\",\"open_folder\":\"Abrir la carpeta {{name}}\",\"project_folder_change\":\"Carpeta del proyecto: {{path}} — cambiar\",\"project_folder_path\":\"Ruta de la carpeta del proyecto\",\"recent_projects\":\"Proyectos recientes\",\"type_a_path_instead\":\"Escribir una ruta en su lugar\",\"up\":\"Subir\",\"use_recent_project\":\"Usar el proyecto reciente {{path}}\",\"use_this_folder\":\"Usar esta carpeta\",\"use_this_folder_path\":\"Usar esta carpeta: {{path}}\",\"load_failed\":\"No se pudo listar esta carpeta\",\"load_failed_unknown\":\"La lectura falló sin indicar el motivo.\",\"retry\":\"Reintentar\"},\"settingsModal\":{\"cancel\":\"Cancelar\",\"couldn_t_load_these_settings\":\"No se pudieron cargar estos ajustes, así que no se puede guardar hasta que carguen.\",\"couldn_t_save_these_settings\":\"No se pudieron guardar estos ajustes.\",\"default_keeps_the_model_your_chat_agent_resolves\":\"Predeterminado mantiene el modelo que tu agente de chat ya resuelve. Una selección se aplica a las sesiones de spec que comiencen después del cambio; una spec en curso conserva su modelo actual.\",\"empty_keep_specs_with_each_project_recommended\":\"Vacío = mantener las specs junto a cada proyecto (recomendado)\",\"leave_this_empty_to_keep_specs_inside_each_proje\":\"Deja esto vacío para mantener las specs dentro de cada proyecto (una carpeta .kiro/specs junto a tu código: el estándar de Kiro). O indica una ruta de carpeta para reunir todas las specs en un solo lugar.\",\"model_default_inherit\":\"Predeterminado (heredar)\",\"save\":\"Guardar\",\"saving\":\"Guardando…\",\"settings\":\"Ajustes\",\"spec_generation_model\":\"Modelo para la generación de specs\",\"spec_storage_folder_path\":\"Ruta de la carpeta de almacenamiento de specs\",\"where_should_specs_be_saved\":\"¿Dónde se deben guardar las specs?\",\"which_model_should_run_spec_generation\":\"¿Qué modelo debe ejecutar la generación de specs?\"},\"shimmer\":{\"loading_specs\":\"Cargando specs…\",\"loading_the_conversation\":\"Cargando la conversación…\",\"writing_this_document\":\"Escribiendo este documento…\"},\"specDetail\":{\"advance_to_design\":\"Aprobar → Diseño\",\"advance_to_tasks\":\"Aprobar → Tareas\",\"an_agent_will_work_through_the_task_list\":\"Un agente irá completando la lista de tareas\",\"approved\":\"Aprobado\",\"approved_by_user\":\"Aprobado por {{user}}\",\"archive_this_spec\":\"Archivar esta spec\",\"cancel\":\"Cancelar\",\"changed_since_approval\":\"Cambió tras la aprobación\",\"clear\":\"Vaciar\",\"close_esc\":\"Cerrar (Esc)\",\"close_review_view\":\"Cerrar la vista de revisión\",\"couldn_t_remove_this_spec_try_again\":\"No se pudo quitar esta especificación — inténtalo de nuevo.\",\"delete_spec_named\":\"Quitar la especificación {{name}}\",\"delete_this_spec\":\"Quitar esta especificación\",\"document_file_name\":\"{{name}}.md\",\"drafting_design\":\"Redactando el diseño…\",\"drafting_tasks\":\"Redactando las tareas…\",\"drag_or_use_to_resize\":\"Arrastra o usa ← → para redimensionar\",\"duplicate_this_spec\":\"Duplicar esta spec\",\"expand_document_for_review\":\"Ampliar el documento para revisarlo\",\"expand_for_review_esc_to_close\":\"Ampliar para revisar (Esc para cerrar)\",\"name_for_the_copy\":\"Nombre de la copia\",\"pause\":\"Pausar\",\"pausing\":\"Pausando…\",\"pending_comment_many\":\"{{count}} comentarios pendientes\",\"pending_comment_one\":\"{{count}} comentario pendiente\",\"pending_comment_other\":\"{{count}} comentarios pendientes\",\"remove_comment_on\":\"Quitar el comentario sobre {{document}}\",\"remove_spec_body\":\"“{{name}}” saldrá de Spec Builder. Los archivos markdown se quedan en el proyecto y se detendrá cualquier agente en ejecución para esta especificación.\",\"remove_this_spec\":\"¿Quitar esta especificación?\",\"removing\":\"Quitando…\",\"rename_this_spec_label_the_folder_name_stays\":\"Cambia la etiqueta de esta spec. Su carpeta y su rama conservan el mismo nombre.\",\"resize_document_panel\":\"Redimensionar el panel del documento\",\"restore_this_spec\":\"Restaurar esta spec\",\"review_document_named\":\"Revisar {{document}}.md de {{name}}\",\"send_all_to_agent\":\"Enviar todo al agente\",\"sending\":\"Enviando…\",\"spec_label\":\"Etiqueta de la spec\",\"start_building\":\"Empezar a construir\",\"starting\":\"Iniciando…\",\"tab_design\":\"Diseño\",\"tab_requirements\":\"Requisitos\",\"tab_tasks\":\"Tareas\",\"tells_the_agent_this_phase_is_approved_and_to_mo\":\"Registra tu aprobación de esta versión y luego le dice al agente que siga adelante\",\"the_agent_is_writing_the_next_document\":\"Aprobado: el agente está escribiendo el siguiente documento\",\"this_document_changed_after_it_was_approved\":\"Este documento cambió después de aprobarse\",\"working\":\"trabajando…\"},\"specRail\":{\"active\":\"ACTIVOS\",\"agent_working\":\"agente trabajando\",\"an_agent_is_working\":\"Un agente está trabajando\",\"filter_specs\":\"Filtrar specs\",\"filter_specs_by_name\":\"Filtrar specs por nombre\",\"new_spec\":\"Nueva spec\",\"plan_ready\":\"PLAN LISTO\",\"settings\":\"Ajustes\",\"show_spec_list\":\"Mostrar la lista de specs\",\"show_specs\":\"Mostrar specs\",\"spec_builder\":\"Spec Builder\",\"spec_builder_settings\":\"Ajustes de Spec Builder\",\"specs\":\"SPECS\",\"v\":\"v\"},\"specStatePanel\":{\"answer_option\":\"Responder “{{title}}” con {{option}}\",\"answer_option_recommended\":\"Responder “{{title}}” con {{option}} (recomendado)\",\"answered\":\"respondida\",\"blocking\":\"BLOQUEO\",\"context\":\"CONTEXTO\",\"decision_title\":\"Decisión — {{title}}\",\"decisions\":\"DECISIONES\",\"options_for\":\"Opciones para {{title}}\",\"pending\":\"pendiente\",\"recommended\":\"RECOMENDADO\",\"sending\":\"enviando…\",\"template\":\"Plantilla\",\"tool_calls\":\"Llamadas a herramientas\",\"turns\":\"Turnos\",\"worktree\":\"Worktree\"},\"taskList\":{\"done\":\"Hecha\",\"no_tasks_yet\":\"Todavía no hay tareas. Cuando apruebes el diseño, la lista ordenada de tareas aparecerá aquí y podrás ejecutarlas de una en una.\",\"pause_the_build_first\":\"Pausa la construcción antes de ejecutar una sola tarea\",\"run\":\"Ejecutar\",\"run_only_this_task_and_stop\":\"Ejecutar solo esta tarea y luego parar\",\"run_task\":\"Ejecutar la tarea: {{task}}\",\"starting\":\"Iniciando…\",\"task_progress\":\"Avance de las tareas\",\"done_of_total_one\":\"{{done}} de {{total}} tarea hecha\",\"done_of_total_many\":\"{{done}} de {{total}} tareas hechas\",\"done_of_total_other\":\"{{done}} de {{total}} tareas hechas\"},\"workspace\":{\"describe_what_you_want_to_build_answer_a_few_que\":\"Describe lo que quieres construir, responde unas preguntas y obtén un plan revisado — requisitos, diseño y tareas — que un agente puede llevar a cabo.\",\"pick_a_spec_to_continue_where_you_left_off\":\"Elige una spec para continuar donde lo dejaste\",\"plan_your_next_feature_with_a_spec\":\"Planifica tu próxima función con una spec\",\"resize_spec_list\":\"Redimensionar la lista de specs\",\"start_your_first_spec\":\"Crea tu primera spec\"}},\"manifest\":{\"description\":\"Desarrollo basado en especificaciones dentro de Kiro Crew: convierte una idea de función en Requisitos → Diseño → Tareas con un agente integrado, revisa el markdown en la propia app y luego entrega el plan aprobado a una sesión de ejecución autónoma.\",\"display_name\":\"Spec Builder\",\"page_label\":\"Spec Builder\",\"use_case_1\":\"Convierte una función, un error o una tarea rápida en requisitos, diseño y pasos de implementación vinculados al repositorio y listos para revisar.\",\"configuration_1\":\"Elige una carpeta de proyecto y el modo Feature, Bug o Quick, crea si quieres un worktree nuevo y revisa y aprueba cada fase generada antes de iniciar la compilación.\"},\"specBuilderPage\":{\"spec_builder\":\"Spec Builder\",\"talk_through_an_idea_review_the_plan_then_let_an\":\"Comenta una idea, revisa el plan y deja que un agente la construya.\"}},\"issueRadar\":{\"components\":{\"detailOverflowMenu\":{\"more_actions\":\"Más acciones\"}}},\"meetings\":{\"review\":{\"archivedSection\":\"Archivadas\"}}}"),
		components: {
			"ui": {
				"no_noun_match": "No hay {{noun}} que coincidan",
				"no_matches_for": "Sin coincidencias para",
				"clear_filter": "Borrar filtro"
			},
			"resizeHandle": { "drag_to_resize": "Arrastra para redimensionar" }
		}
	},
	fr: {
		apps: /* @__PURE__ */ JSON.parse("{\"specBuilder\":{\"api\":{\"phase_building\":\"en construction\",\"phase_design\":\"conception\",\"phase_new\":\"tout juste commencée\",\"phase_ready\":\"prête\",\"phase_requirements\":\"exigences\",\"phase_tasks\":\"plan prêt\",\"something_went_wrong\":\"Quelque chose s'est mal passé ({{status}})\"},\"components\":{\"chatColumn\":{\"reply_to_the_spec_agent\":\"Répondre à l'agent Spec…\"},\"columnSplitter\":{\"drag_or_use_to_resize\":\"Fais glisser ou utilise ← → pour redimensionner\"},\"docView\":{\"add_comment\":\"Ajouter un commentaire\",\"comment\":\"Commenter\",\"comment_on_the_selected_passage\":\"Commenter le passage sélectionné\",\"discard_this_comment\":\"Supprimer ce commentaire\",\"document_file_name\":\"{{name}}.md\",\"empty_design\":\"Pas encore de conception. Dès que tu approuves les exigences dans la conversation, la conception technique apparaît ici.\",\"empty_requirements\":\"Aucune exigence rédigée pour le moment — décris ce que tu veux dans la conversation et l'agent rédigera ce document.\",\"empty_tasks\":\"Pas encore de liste de tâches. Une fois la conception approuvée, la liste ordonnée des tâches apparaît ici.\",\"nothing_here_yet\":\"Rien ici pour le moment.\",\"your_feedback_on_the_passage_in\":\"Ton retour sur le passage sélectionné dans {{document}}\",\"your_feedback_on_this_passage_enter_adds_it_to_t\":\"Ton retour sur ce passage… (Entrée l'ajoute à la pile)\"},\"newSpecView\":{\"describe_what_you_want_to_do\":\"Décris ce que tu veux faire\",\"e_g_add_login_with_google_so_users_don_t_need_pa\":\"par ex. « Ajouter la connexion avec Google pour éviter les mots de passe » ou « Le bouton d'export plante sur les gros fichiers »\",\"fresh_worktree_option_pick_a_project_folder_abov\":\"Option worktree dédié : choisis un dossier de projet ci-dessus — s'il s'agit d'un dépôt git, je peux planifier et construire dans un worktree dédié pour que ton checkout principal reste intact.\",\"keeps_your_main_checkout_untouched_branch\":\"Ton checkout principal reste intact : je crée une branche {{branch}} dans son propre dossier à côté du dépôt, et j'y planifie et construis.\",\"let_s_plan_something\":\"Planifions quelque chose\",\"never_mind\":\"Annuler\",\"settings\":\"Paramètres\",\"start_the_conversation\":\"Démarrer la conversation →\",\"starting\":\"Démarrage…\",\"tell_me_what_you_have_in_mind_i_ll_ask_a_few_cla\":\"Dis-moi ce que tu as en tête. Je poserai quelques questions de clarification dans le chat, je rédigerai un plan que tu pourras relire, puis je le construirai quand tu seras prêt.\",\"this_folder_isn_t_a_git_repository_so_i_ll_work\":\"Ce dossier n'est pas un dépôt git, je travaillerai donc directement dedans. Choisis un dépôt git pour avoir l'option d'un worktree dédié (ton checkout principal reste intact).\",\"this_spec_will_be_called\":\"Cette spécification s’appellera {{name}}\",\"type_bug_blurb\":\"Enquête sur le problème, trouve la cause racine et planifie la correction.\",\"type_bug_title\":\"Corriger un bug\",\"type_feature_blurb\":\"Un plan complet : exigences, conception technique et liste de tâches.\",\"type_feature_title\":\"Construire quelque chose de nouveau\",\"type_quick_blurb\":\"Sans formalités — juste un objectif et une liste de tâches.\",\"type_quick_title\":\"Plan rapide\",\"what_do_you_want_to_do\":\"Que veux-tu faire ?\",\"what_kind_of_work_is_it\":\"De quel type de travail s'agit-il ?\",\"which_project_is_this_for\":\"Pour quel projet est-ce ?\",\"work_in_a_fresh_worktree\":\"Travailler dans un worktree dédié\",\"your_plan_is_saved_as_plain_markdown_inside_your\":\"Ton plan est enregistré en markdown brut dans ton projet (.kiro/specs), il fonctionne donc aussi avec l'IDE Kiro et la CLI. Tu peux changer l'endroit où les specs sont stockées dans\"},\"projectPicker\":{\"browse\":\"Parcourir\",\"change\":\"modifier\",\"choose_a_project_folder\":\"Choisir un dossier de projet…\",\"choose_a_project_folder_aria\":\"Choisir un dossier de projet\",\"go_to_parent_folder\":\"Aller au dossier parent\",\"hide_path_input\":\"Masquer le champ de chemin\",\"home_you_projects_my_app\":\"/home/you/projects/my-app\",\"loading\":\"Chargement…\",\"no_subfolders_here_use_use_this_folder_above_to\":\"Aucun sous-dossier ici — utilise « Utiliser ce dossier » ci-dessus pour choisir celui-ci.\",\"open_folder\":\"Ouvrir le dossier {{name}}\",\"project_folder_change\":\"Dossier de projet : {{path}} — modifier\",\"project_folder_path\":\"Chemin du dossier de projet\",\"recent_projects\":\"Projets récents\",\"type_a_path_instead\":\"Saisir un chemin à la place\",\"up\":\"Remonter\",\"use_recent_project\":\"Utiliser le projet récent {{path}}\",\"use_this_folder\":\"Utiliser ce dossier\",\"use_this_folder_path\":\"Utiliser ce dossier : {{path}}\",\"load_failed\":\"Impossible de lister ce dossier\",\"load_failed_unknown\":\"La lecture a échoué sans raison indiquée.\",\"retry\":\"Réessayer\"},\"settingsModal\":{\"cancel\":\"Annuler\",\"couldn_t_load_these_settings\":\"Impossible de charger ces paramètres : l’enregistrement est désactivé tant qu’ils ne sont pas chargés.\",\"couldn_t_save_these_settings\":\"Impossible d’enregistrer ces paramètres.\",\"default_keeps_the_model_your_chat_agent_resolves\":\"Par défaut conserve le modèle que votre agent de chat résout déjà. Un choix s’applique aux sessions de spec démarrées après le changement — une spec en cours conserve son modèle actuel.\",\"empty_keep_specs_with_each_project_recommended\":\"Vide = garder les specs avec chaque projet (recommandé)\",\"leave_this_empty_to_keep_specs_inside_each_proje\":\"Laisse ce champ vide pour garder les specs dans chaque projet (un dossier .kiro/specs à côté de ton code — le standard Kiro). Ou indique un chemin de dossier pour rassembler toutes les specs au même endroit.\",\"model_default_inherit\":\"Par défaut (hériter)\",\"save\":\"Enregistrer\",\"saving\":\"Enregistrement…\",\"settings\":\"Paramètres\",\"spec_generation_model\":\"Modèle de génération de specs\",\"spec_storage_folder_path\":\"Chemin du dossier de stockage des specs\",\"where_should_specs_be_saved\":\"Où enregistrer les specs ?\",\"which_model_should_run_spec_generation\":\"Quel modèle doit exécuter la génération de specs ?\"},\"shimmer\":{\"loading_specs\":\"Chargement des specs…\",\"loading_the_conversation\":\"Chargement de la conversation…\",\"writing_this_document\":\"Rédaction de ce document…\"},\"specDetail\":{\"advance_to_design\":\"Approuver → Conception\",\"advance_to_tasks\":\"Approuver → Tâches\",\"an_agent_will_work_through_the_task_list\":\"Un agent va dérouler la liste des tâches\",\"approved\":\"Approuvé\",\"approved_by_user\":\"Approuvé par {{user}}\",\"archive_this_spec\":\"Archiver cette spec\",\"cancel\":\"Annuler\",\"changed_since_approval\":\"Modifié depuis l’approbation\",\"clear\":\"Effacer\",\"close_esc\":\"Fermer (Échap)\",\"close_review_view\":\"Fermer la vue de relecture\",\"couldn_t_remove_this_spec_try_again\":\"Impossible de retirer cette spécification — réessayez.\",\"delete_spec_named\":\"Retirer la spécification {{name}}\",\"delete_this_spec\":\"Retirer cette spécification\",\"document_file_name\":\"{{name}}.md\",\"drafting_design\":\"Rédaction de la conception…\",\"drafting_tasks\":\"Rédaction des tâches…\",\"drag_or_use_to_resize\":\"Faites glisser ou utilisez ← → pour redimensionner\",\"duplicate_this_spec\":\"Dupliquer cette spec\",\"expand_document_for_review\":\"Agrandir le document pour la relecture\",\"expand_for_review_esc_to_close\":\"Agrandir pour relire (Échap pour fermer)\",\"name_for_the_copy\":\"Nom de la copie\",\"pause\":\"Mettre en pause\",\"pausing\":\"Mise en pause…\",\"pending_comment_many\":\"{{count}} commentaires en attente\",\"pending_comment_one\":\"{{count}} commentaire en attente\",\"pending_comment_other\":\"{{count}} commentaires en attente\",\"remove_comment_on\":\"Supprimer le commentaire sur {{document}}\",\"remove_spec_body\":\"« {{name}} » quittera Spec Builder. Les fichiers markdown restent dans le projet, et tout agent en cours pour cette spécification sera arrêté.\",\"remove_this_spec\":\"Retirer cette spécification ?\",\"removing\":\"Retrait…\",\"rename_this_spec_label_the_folder_name_stays\":\"Renommez le libellé de cette spec. Son dossier et sa branche gardent le même nom.\",\"resize_document_panel\":\"Redimensionner le panneau du document\",\"restore_this_spec\":\"Restaurer cette spec\",\"review_document_named\":\"Relire {{document}}.md pour {{name}}\",\"send_all_to_agent\":\"Tout envoyer à l'agent\",\"sending\":\"Envoi…\",\"spec_label\":\"Libellé de la spec\",\"start_building\":\"Lancer la construction\",\"starting\":\"Démarrage…\",\"tab_design\":\"Conception\",\"tab_requirements\":\"Exigences\",\"tab_tasks\":\"Tâches\",\"tells_the_agent_this_phase_is_approved_and_to_mo\":\"Enregistre votre approbation de cette version, puis demande à l’agent de continuer\",\"the_agent_is_writing_the_next_document\":\"Approuvé — l’agent rédige le document suivant\",\"this_document_changed_after_it_was_approved\":\"Ce document a changé après son approbation\",\"working\":\"en cours…\"},\"specRail\":{\"active\":\"ACTIFS\",\"agent_working\":\"agent au travail\",\"an_agent_is_working\":\"Un agent travaille\",\"filter_specs\":\"Filtrer les specs\",\"filter_specs_by_name\":\"Filtrer les specs par nom\",\"new_spec\":\"Nouvelle spec\",\"plan_ready\":\"PLAN PRÊT\",\"settings\":\"Paramètres\",\"show_spec_list\":\"Afficher la liste des specs\",\"show_specs\":\"Afficher les specs\",\"spec_builder\":\"Spec Builder\",\"spec_builder_settings\":\"Paramètres de Spec Builder\",\"specs\":\"SPECS\",\"v\":\"v\"},\"specStatePanel\":{\"answer_option\":\"Répondre à « {{title}} » par {{option}}\",\"answer_option_recommended\":\"Répondre à « {{title}} » par {{option}} (recommandé)\",\"answered\":\"répondu\",\"blocking\":\"BLOCAGE\",\"context\":\"CONTEXTE\",\"decision_title\":\"Décision — {{title}}\",\"decisions\":\"DÉCISIONS\",\"options_for\":\"Options pour {{title}}\",\"pending\":\"en attente\",\"recommended\":\"RECOMMANDÉ\",\"sending\":\"envoi…\",\"template\":\"Modèle\",\"tool_calls\":\"Appels d'outils\",\"turns\":\"Tours\",\"worktree\":\"Worktree\"},\"taskList\":{\"done\":\"Terminée\",\"no_tasks_yet\":\"Pas encore de tâches. Une fois la conception approuvée, la liste ordonnée des tâches apparaît ici et vous pouvez les lancer une par une.\",\"pause_the_build_first\":\"Mettez la construction en pause avant de lancer une seule tâche\",\"run\":\"Lancer\",\"run_only_this_task_and_stop\":\"Lancer uniquement cette tâche, puis s’arrêter\",\"run_task\":\"Lancer la tâche : {{task}}\",\"starting\":\"Démarrage…\",\"task_progress\":\"Avancement des tâches\",\"done_of_total_one\":\"Tâches terminées : {{done}}/{{total}}\",\"done_of_total_many\":\"Tâches terminées : {{done}}/{{total}}\",\"done_of_total_other\":\"Tâches terminées : {{done}}/{{total}}\"},\"workspace\":{\"describe_what_you_want_to_build_answer_a_few_que\":\"Décris ce que tu veux construire, réponds à quelques questions et obtiens un plan relu — exigences, conception et tâches — qu'un agent peut réaliser.\",\"pick_a_spec_to_continue_where_you_left_off\":\"Choisis une spec pour reprendre là où tu en étais\",\"plan_your_next_feature_with_a_spec\":\"Planifie ta prochaine fonctionnalité avec une spec\",\"resize_spec_list\":\"Redimensionner la liste des specs\",\"start_your_first_spec\":\"Crée ta première spec\"}},\"manifest\":{\"description\":\"Développement piloté par les spécifications au sein de Kiro Crew : transforme une idée de fonctionnalité en Exigences → Conception → Tâches avec un agent intégré, relis le markdown dans l’application, puis confie le plan approuvé à une session d’exécution autonome.\",\"display_name\":\"Spec Builder\",\"page_label\":\"Spec Builder\",\"use_case_1\":\"Transforme une fonctionnalité, un bug ou une tâche rapide en exigences, conception et étapes d'implémentation tenant compte du dépôt et prêtes à être relues.\",\"configuration_1\":\"Choisis un dossier de projet et le mode Feature, Bug ou Quick, crée éventuellement un nouveau worktree, puis relis et approuve chaque étape générée avant de lancer la réalisation.\"},\"specBuilderPage\":{\"spec_builder\":\"Spec Builder\",\"talk_through_an_idea_review_the_plan_then_let_an\":\"Discute d'une idée, relis le plan, puis laisse un agent la construire.\"}},\"issueRadar\":{\"components\":{\"detailOverflowMenu\":{\"more_actions\":\"Plus d'actions\"}}},\"meetings\":{\"review\":{\"archivedSection\":\"Archivées\"}}}"),
		components: {
			"ui": {
				"no_noun_match": "Aucun(e) {{noun}} correspondant(e)",
				"no_matches_for": "Aucun résultat pour",
				"clear_filter": "Effacer le filtre"
			},
			"resizeHandle": { "drag_to_resize": "Faire glisser pour redimensionner" }
		}
	},
	hi: {
		apps: /* @__PURE__ */ JSON.parse("{\"specBuilder\":{\"api\":{\"phase_building\":\"बन रहा है\",\"phase_design\":\"डिज़ाइन\",\"phase_new\":\"अभी शुरू हुआ\",\"phase_ready\":\"तैयार\",\"phase_requirements\":\"आवश्यकताएं\",\"phase_tasks\":\"योजना तैयार\",\"something_went_wrong\":\"कुछ गड़बड़ हो गई ({{status}})\"},\"components\":{\"chatColumn\":{\"reply_to_the_spec_agent\":\"Spec एजेंट को उत्तर दो…\"},\"columnSplitter\":{\"drag_or_use_to_resize\":\"आकार बदलने के लिए खींचो या ← → का उपयोग करो\"},\"docView\":{\"add_comment\":\"टिप्पणी जोड़ो\",\"comment\":\"टिप्पणी करो\",\"comment_on_the_selected_passage\":\"चुने गए अंश पर टिप्पणी करो\",\"discard_this_comment\":\"इस टिप्पणी को छोड़ दो\",\"document_file_name\":\"{{name}}.md\",\"empty_design\":\"अभी कोई डिज़ाइन नहीं है। जैसे ही तुम बातचीत में आवश्यकताएं स्वीकृत कर दोगे, तकनीकी डिज़ाइन यहाँ आ जाएगा।\",\"empty_requirements\":\"अभी कोई आवश्यकताएं नहीं लिखी गई हैं — बातचीत में बताओ कि तुम क्या चाहते हो और एजेंट यह दस्तावेज़ लिख देगा।\",\"empty_tasks\":\"अभी कोई कार्य सूची नहीं है। डिज़ाइन स्वीकृत करने के बाद क्रमबद्ध कार्य सूची यहाँ आ जाएगी।\",\"nothing_here_yet\":\"यहाँ अभी कुछ नहीं है।\",\"your_feedback_on_the_passage_in\":\"{{document}} में चुने गए अंश पर तुम्हारी प्रतिक्रिया\",\"your_feedback_on_this_passage_enter_adds_it_to_t\":\"इस अंश पर तुम्हारी प्रतिक्रिया… (Enter इसे सूची में जोड़ता है)\"},\"newSpecView\":{\"describe_what_you_want_to_do\":\"बताओ कि तुम क्या करना चाहते हो\",\"e_g_add_login_with_google_so_users_don_t_need_pa\":\"उदाहरण: “Google से लॉगिन जोड़ो ताकि उपयोगकर्ताओं को पासवर्ड की ज़रूरत न पड़े” या “बड़ी फ़ाइलों पर एक्सपोर्ट बटन क्रैश हो जाता है”\",\"fresh_worktree_option_pick_a_project_folder_abov\":\"नया worktree विकल्प: ऊपर कोई प्रोजेक्ट फ़ोल्डर चुनो — यदि वह git रिपॉज़िटरी है, तो मैं एक अलग worktree में योजना बनाकर काम कर सकता हूँ, जिससे तुम्हारा मुख्य checkout अछूता रहता है।\",\"keeps_your_main_checkout_untouched_branch\":\"तुम्हारा मुख्य checkout अछूता रहता है: मैं रिपॉज़िटरी के बगल में अपने अलग फ़ोल्डर में {{branch}} ब्रांच बनाऊँगा, और वहीं योजना बनाकर काम करूँगा।\",\"let_s_plan_something\":\"कुछ योजना बनाएं\",\"never_mind\":\"रद्द करें\",\"settings\":\"सेटिंग्स\",\"start_the_conversation\":\"बातचीत शुरू करो →\",\"starting\":\"शुरू हो रहा है…\",\"tell_me_what_you_have_in_mind_i_ll_ask_a_few_cla\":\"बताओ कि तुम्हारे मन में क्या है। मैं चैट में कुछ स्पष्टीकरण प्रश्न पूछूँगा, एक योजना लिखूँगा जिसे तुम देख सको, और फिर जब तुम तैयार हो तो उसे बनाऊँगा।\",\"this_folder_isn_t_a_git_repository_so_i_ll_work\":\"यह फ़ोल्डर git रिपॉज़िटरी नहीं है, इसलिए मैं सीधे इसी में काम करूँगा। नया worktree विकल्प पाने के लिए कोई git रिपॉज़िटरी चुनो (तुम्हारा मुख्य checkout अछूता रहता है)।\",\"this_spec_will_be_called\":\"इस स्पेक का नाम {{name}} होगा\",\"type_bug_blurb\":\"समस्या की जाँच करो, मूल कारण खोजो, और उसे ठीक करने की योजना बनाओ।\",\"type_bug_title\":\"कोई बग ठीक करो\",\"type_feature_blurb\":\"पूरी योजना: आवश्यकताएं, तकनीकी डिज़ाइन और कार्य सूची।\",\"type_feature_title\":\"कुछ नया बनाओ\",\"type_quick_blurb\":\"औपचारिकता छोड़ो — केवल एक लक्ष्य और कार्य सूची।\",\"type_quick_title\":\"झटपट योजना\",\"what_do_you_want_to_do\":\"तुम क्या करना चाहते हो?\",\"what_kind_of_work_is_it\":\"यह किस तरह का काम है?\",\"which_project_is_this_for\":\"यह किस प्रोजेक्ट के लिए है?\",\"work_in_a_fresh_worktree\":\"नए worktree में काम करें\",\"your_plan_is_saved_as_plain_markdown_inside_your\":\"तुम्हारी योजना प्रोजेक्ट के भीतर सामान्य markdown के रूप में सहेजी जाती है (.kiro/specs), इसलिए यह Kiro IDE और CLI के साथ भी काम करती है। spec कहाँ रखे जाएँ, यह बदलो\"},\"projectPicker\":{\"browse\":\"ब्राउज़ करो\",\"change\":\"बदलें\",\"choose_a_project_folder\":\"प्रोजेक्ट फ़ोल्डर चुनो…\",\"choose_a_project_folder_aria\":\"प्रोजेक्ट फ़ोल्डर चुनो\",\"go_to_parent_folder\":\"मूल फ़ोल्डर पर जाओ\",\"hide_path_input\":\"पथ इनपुट छिपाओ\",\"home_you_projects_my_app\":\"/home/you/projects/my-app\",\"loading\":\"लोड हो रहा है…\",\"no_subfolders_here_use_use_this_folder_above_to\":\"यहाँ कोई सब-फ़ोल्डर नहीं है — इसी को चुनने के लिए ऊपर “इस फ़ोल्डर का उपयोग करो” दबाओ।\",\"open_folder\":\"फ़ोल्डर {{name}} खोलो\",\"project_folder_change\":\"प्रोजेक्ट फ़ोल्डर: {{path}} — बदलो\",\"project_folder_path\":\"प्रोजेक्ट फ़ोल्डर का पथ\",\"recent_projects\":\"हाल के प्रोजेक्ट\",\"type_a_path_instead\":\"इसके बजाय पथ लिखो\",\"up\":\"ऊपर\",\"use_recent_project\":\"हाल का प्रोजेक्ट {{path}} इस्तेमाल करो\",\"use_this_folder\":\"इस फ़ोल्डर का उपयोग करो\",\"use_this_folder_path\":\"इस फ़ोल्डर का उपयोग करो: {{path}}\",\"load_failed\":\"इस फ़ोल्डर की सूची नहीं मिल सकी\",\"load_failed_unknown\":\"पढ़ना बिना किसी कारण के विफल हुआ।\",\"retry\":\"फिर कोशिश करो\"},\"settingsModal\":{\"cancel\":\"रद्द करें\",\"couldn_t_load_these_settings\":\"ये सेटिंग्स लोड नहीं हो सकीं, इसलिए लोड होने तक सहेजना बंद है।\",\"couldn_t_save_these_settings\":\"ये सेटिंग्स सहेजी नहीं जा सकीं।\",\"default_keeps_the_model_your_chat_agent_resolves\":\"डिफ़ॉल्ट वही मॉडल रखता है जो तुम्हारा चैट एजेंट पहले से तय करता है। चुना गया मॉडल बदलाव के बाद शुरू होने वाले spec सत्रों पर लागू होता है — चल रही spec अपना मौजूदा मॉडल रखती है।\",\"empty_keep_specs_with_each_project_recommended\":\"खाली = spec को उसी प्रोजेक्ट के साथ रखें (अनुशंसित)\",\"leave_this_empty_to_keep_specs_inside_each_proje\":\"spec को हर प्रोजेक्ट के भीतर रखने के लिए इसे खाली छोड़ो (तुम्हारे कोड के बगल में .kiro/specs फ़ोल्डर — Kiro का मानक)। या सभी spec को एक जगह इकट्ठा करने के लिए फ़ोल्डर पथ सेट करो।\",\"model_default_inherit\":\"डिफ़ॉल्ट (इनहेरिट)\",\"save\":\"सहेजो\",\"saving\":\"सहेजा जा रहा है…\",\"settings\":\"सेटिंग्स\",\"spec_generation_model\":\"spec जनरेशन मॉडल\",\"spec_storage_folder_path\":\"spec संग्रह फ़ोल्डर का पथ\",\"where_should_specs_be_saved\":\"spec कहाँ सहेजे जाने चाहिए?\",\"which_model_should_run_spec_generation\":\"spec जनरेशन कौन-सा मॉडल चलाए?\"},\"shimmer\":{\"loading_specs\":\"spec लोड हो रहे हैं…\",\"loading_the_conversation\":\"बातचीत लोड हो रही है…\",\"writing_this_document\":\"यह दस्तावेज़ लिखा जा रहा है…\"},\"specDetail\":{\"advance_to_design\":\"स्वीकृत करो → डिज़ाइन\",\"advance_to_tasks\":\"स्वीकृत करो → कार्य\",\"an_agent_will_work_through_the_task_list\":\"एक एजेंट कार्य सूची पूरी करेगा\",\"approved\":\"स्वीकृत\",\"approved_by_user\":\"{{user}} ने स्वीकृत किया\",\"archive_this_spec\":\"इस spec को संग्रहित करो\",\"cancel\":\"रद्द करें\",\"changed_since_approval\":\"स्वीकृति के बाद बदला\",\"clear\":\"खाली करें\",\"close_esc\":\"बंद करें (Esc)\",\"close_review_view\":\"समीक्षा दृश्य बंद करें\",\"couldn_t_remove_this_spec_try_again\":\"यह स्पेक हटाया नहीं जा सका — पुन: प्रयास करें।\",\"delete_spec_named\":\"स्पेक {{name}} हटाएँ\",\"delete_this_spec\":\"यह स्पेक हटाएँ\",\"document_file_name\":\"{{name}}.md\",\"drafting_design\":\"डिज़ाइन लिखा जा रहा है…\",\"drafting_tasks\":\"कार्य लिखे जा रहे हैं…\",\"drag_or_use_to_resize\":\"आकार बदलने के लिए खींचें या ← → का उपयोग करें\",\"duplicate_this_spec\":\"इस spec की नकल बनाओ\",\"expand_document_for_review\":\"समीक्षा के लिए दस्तावेज़ बड़ा करो\",\"expand_for_review_esc_to_close\":\"समीक्षा के लिए बड़ा करो (Esc से बंद)\",\"name_for_the_copy\":\"नकल का नाम\",\"pause\":\"रोको\",\"pausing\":\"रोका जा रहा है…\",\"pending_comment_one\":\"{{count}} लंबित टिप्पणी\",\"pending_comment_other\":\"{{count}} लंबित टिप्पणियाँ\",\"remove_comment_on\":\"{{document}} पर की गई टिप्पणी हटाओ\",\"remove_spec_body\":\"“{{name}}” Spec Builder से हट जाएगा। मार्कडाउन फ़ाइलें परियोजना में रहेंगी, और इस स्पेक पर चल रहा कोई एजेंट रोक दिया जाएगा।\",\"remove_this_spec\":\"यह स्पेक हटाएँ?\",\"removing\":\"हटाया जा रहा है…\",\"rename_this_spec_label_the_folder_name_stays\":\"इस spec का लेबल बदलो। इसके फ़ोल्डर और ब्रांच का नाम वही रहेगा।\",\"resize_document_panel\":\"दस्तावेज़ पैनल का आकार बदलें\",\"restore_this_spec\":\"इस spec को बहाल करो\",\"review_document_named\":\"{{name}} के लिए {{document}}.md की समीक्षा करें\",\"send_all_to_agent\":\"सब कुछ एजेंट को भेजें\",\"sending\":\"भेजा जा रहा है…\",\"spec_label\":\"Spec का लेबल\",\"start_building\":\"बनाना शुरू करो\",\"starting\":\"शुरू हो रहा है…\",\"tab_design\":\"डिज़ाइन\",\"tab_requirements\":\"आवश्यकताएं\",\"tab_tasks\":\"कार्य\",\"tells_the_agent_this_phase_is_approved_and_to_mo\":\"इस संस्करण के लिए तुम्हारी स्वीकृति दर्ज करता है, फिर एजेंट से आगे बढ़ने को कहता है\",\"the_agent_is_writing_the_next_document\":\"स्वीकृत — एजेंट अगला दस्तावेज़ लिख रहा है\",\"this_document_changed_after_it_was_approved\":\"यह दस्तावेज़ स्वीकृत होने के बाद बदल गया\",\"working\":\"काम चल रहा है…\"},\"specRail\":{\"active\":\"सक्रिय\",\"agent_working\":\"एजेंट काम कर रहा है\",\"an_agent_is_working\":\"एक एजेंट काम कर रहा है\",\"filter_specs\":\"spec फ़िल्टर करें\",\"filter_specs_by_name\":\"नाम से spec फ़िल्टर करें\",\"new_spec\":\"नया spec\",\"plan_ready\":\"योजना तैयार\",\"settings\":\"सेटिंग्स\",\"show_spec_list\":\"spec सूची दिखाएं\",\"show_specs\":\"spec दिखाएं\",\"spec_builder\":\"Spec Builder\",\"spec_builder_settings\":\"Spec Builder सेटिंग्स\",\"specs\":\"SPECS\",\"v\":\"v\"},\"specStatePanel\":{\"answer_option\":\"“{{title}}” का उत्तर “{{option}}” से दें\",\"answer_option_recommended\":\"“{{title}}” का उत्तर “{{option}}” से दें (अनुशंसित)\",\"answered\":\"उत्तर दिया\",\"blocking\":\"अवरोधक\",\"context\":\"संदर्भ\",\"decision_title\":\"निर्णय — {{title}}\",\"decisions\":\"निर्णय\",\"options_for\":\"{{title}} के विकल्प\",\"pending\":\"लंबित\",\"recommended\":\"अनुशंसित\",\"sending\":\"भेजा जा रहा है…\",\"template\":\"टेम्पलेट\",\"tool_calls\":\"टूल कॉल\",\"turns\":\"चक्र\",\"worktree\":\"Worktree\"},\"taskList\":{\"done\":\"पूरा\",\"no_tasks_yet\":\"अभी कोई कार्य नहीं है। डिज़ाइन स्वीकृत करने के बाद क्रमबद्ध कार्य सूची यहाँ आ जाएगी और तुम एक-एक कार्य चला सकोगे।\",\"pause_the_build_first\":\"एक कार्य चलाने से पहले निर्माण रोको\",\"run\":\"चलाओ\",\"run_only_this_task_and_stop\":\"सिर्फ़ यह कार्य चलाओ, फिर रुक जाओ\",\"run_task\":\"कार्य चलाओ: {{task}}\",\"starting\":\"शुरू हो रहा है…\",\"task_progress\":\"कार्य की प्रगति\",\"done_of_total_one\":\"पूरे कार्य: {{done}}/{{total}}\",\"done_of_total_other\":\"पूरे कार्य: {{done}}/{{total}}\"},\"workspace\":{\"describe_what_you_want_to_build_answer_a_few_que\":\"बताओ कि तुम क्या बनाना चाहते हो, कुछ प्रश्नों के उत्तर दो, और एक समीक्षित योजना पाओ — आवश्यकताएं, डिज़ाइन और कार्य — जिसे कोई एजेंट पूरा कर सके।\",\"pick_a_spec_to_continue_where_you_left_off\":\"जहाँ छोड़ा था वहीं से जारी रखने के लिए एक spec चुनो\",\"plan_your_next_feature_with_a_spec\":\"spec के साथ अपनी अगली सुविधा की योजना बनाओ\",\"resize_spec_list\":\"spec सूची का आकार बदलें\",\"start_your_first_spec\":\"अपना पहला spec बनाओ\"}},\"manifest\":{\"description\":\"Kiro Crew के भीतर spec-आधारित डेवलपमेंट: किसी फ़ीचर के आइडिया को एक अंतर्निहित एजेंट के साथ आवश्यकताएं → डिज़ाइन → कार्य में बदलो, ऐप के भीतर ही markdown की समीक्षा करो, और फिर स्वीकृत योजना को किसी स्वायत्त निष्पादन सेशन को सौंप दो।\",\"display_name\":\"Spec Builder\",\"use_case_1\":\"feature, bug या छोटे task को review योग्य, repository-aware requirement, design और implementation step में बदलें।\",\"configuration_1\":\"project folder और Feature, Bug या Quick mode चुनें, चाहें तो नया worktree बनाएँ, फिर build शुरू करने से पहले हर बने हुए चरण की समीक्षा और स्वीकृति दें।\",\"page_label\":\"Spec Builder\"},\"specBuilderPage\":{\"spec_builder\":\"Spec Builder\",\"talk_through_an_idea_review_the_plan_then_let_an\":\"किसी विचार पर बात करो, योजना की समीक्षा करो, और फिर किसी एजेंट से उसे बनवाओ।\"}},\"issueRadar\":{\"components\":{\"detailOverflowMenu\":{\"more_actions\":\"और कार्रवाइयां\"}}},\"meetings\":{\"review\":{\"archivedSection\":\"संग्रहित\"}}}"),
		components: {
			"ui": {
				"no_noun_match": "कोई {{noun}} मेल नहीं",
				"no_matches_for": "कोई मिलान नहीं",
				"clear_filter": "फ़िल्टर साफ़ करें"
			},
			"resizeHandle": { "drag_to_resize": "आकार बदलने के लिए खींचें" }
		}
	},
	it: {
		apps: /* @__PURE__ */ JSON.parse("{\"specBuilder\":{\"api\":{\"phase_building\":\"in costruzione\",\"phase_design\":\"progettazione\",\"phase_new\":\"appena iniziata\",\"phase_ready\":\"pronta\",\"phase_requirements\":\"requisiti\",\"phase_tasks\":\"piano pronto\",\"something_went_wrong\":\"Qualcosa è andato storto ({{status}})\"},\"components\":{\"chatColumn\":{\"reply_to_the_spec_agent\":\"Rispondi all'agente Spec…\"},\"columnSplitter\":{\"drag_or_use_to_resize\":\"Trascina o usa ← → per ridimensionare\"},\"docView\":{\"add_comment\":\"Aggiungi un commento\",\"comment\":\"Commenta\",\"comment_on_the_selected_passage\":\"Commenta il passaggio selezionato\",\"discard_this_comment\":\"Scarta questo commento\",\"document_file_name\":\"{{name}}.md\",\"empty_design\":\"Ancora nessuna progettazione. Una volta approvati i requisiti nella conversazione, la progettazione tecnica comparirà qui.\",\"empty_requirements\":\"Ancora nessun requisito scritto — descrivi cosa vuoi nella conversazione e l'agente redigerà questo documento.\",\"empty_tasks\":\"Ancora nessun elenco di attività. Dopo che avrai approvato la progettazione, l'elenco ordinato delle attività comparirà qui.\",\"nothing_here_yet\":\"Qui non c'è ancora nulla.\",\"your_feedback_on_the_passage_in\":\"Il tuo riscontro sul passaggio selezionato in {{document}}\",\"your_feedback_on_this_passage_enter_adds_it_to_t\":\"Il tuo riscontro su questo passaggio… (Invio lo aggiunge alla pila)\"},\"newSpecView\":{\"describe_what_you_want_to_do\":\"Descrivi cosa vuoi fare\",\"e_g_add_login_with_google_so_users_don_t_need_pa\":\"ad es. «Aggiungi l'accesso con Google così gli utenti non hanno bisogno di password» o «Il pulsante di esportazione va in crash sui file grandi»\",\"fresh_worktree_option_pick_a_project_folder_abov\":\"Opzione worktree dedicato: scegli sopra una cartella di progetto — se è un repository git, posso pianificare e costruire in un worktree dedicato.\",\"keeps_your_main_checkout_untouched_branch\":\"Lascia intatto il tuo checkout principale: creerò un branch {{branch}} in una cartella propria accanto al repository, e pianificherò e costruirò lì.\",\"let_s_plan_something\":\"Pianifichiamo qualcosa\",\"never_mind\":\"Annulla\",\"settings\":\"Impostazioni\",\"start_the_conversation\":\"Avvia la conversazione →\",\"starting\":\"Avvio…\",\"tell_me_what_you_have_in_mind_i_ll_ask_a_few_cla\":\"Dimmi cosa hai in mente. Farò qualche domanda di chiarimento in chat, scriverò un piano che potrai rivedere e poi lo realizzerò quando sarai pronto.\",\"this_folder_isn_t_a_git_repository_so_i_ll_work\":\"Questa cartella non è un repository git, quindi lavorerò direttamente al suo interno. Scegli un repository git per avere l'opzione di un worktree dedicato.\",\"this_spec_will_be_called\":\"Questa specifica si chiamerà {{name}}\",\"type_bug_blurb\":\"Indaga il problema, trova la causa radice e pianifica la correzione.\",\"type_bug_title\":\"Correggi un bug\",\"type_feature_blurb\":\"Un piano completo: requisiti, progettazione tecnica ed elenco delle attività.\",\"type_feature_title\":\"Costruisci qualcosa di nuovo\",\"type_quick_blurb\":\"Salta le formalità — solo un obiettivo e un elenco di attività.\",\"type_quick_title\":\"Piano rapido\",\"what_do_you_want_to_do\":\"Cosa vuoi fare?\",\"what_kind_of_work_is_it\":\"Di che tipo di lavoro si tratta?\",\"which_project_is_this_for\":\"Per quale progetto?\",\"work_in_a_fresh_worktree\":\"Lavora in un worktree dedicato\",\"your_plan_is_saved_as_plain_markdown_inside_your\":\"Il tuo piano viene salvato come markdown semplice all'interno del progetto (.kiro/specs), quindi funziona anche con l'IDE Kiro e la CLI. Puoi cambiare dove vengono archiviate le spec in\"},\"projectPicker\":{\"browse\":\"Sfoglia\",\"change\":\"cambia\",\"choose_a_project_folder\":\"Scegli una cartella di progetto…\",\"choose_a_project_folder_aria\":\"Scegli una cartella di progetto\",\"go_to_parent_folder\":\"Vai alla cartella superiore\",\"hide_path_input\":\"Nascondi il campo del percorso\",\"home_you_projects_my_app\":\"/home/you/projects/my-app\",\"loading\":\"Caricamento…\",\"no_subfolders_here_use_use_this_folder_above_to\":\"Nessuna sottocartella qui — usa «Usa questa cartella» sopra per scegliere questa.\",\"open_folder\":\"Apri la cartella {{name}}\",\"project_folder_change\":\"Cartella di progetto: {{path}} — cambia\",\"project_folder_path\":\"Percorso della cartella di progetto\",\"recent_projects\":\"Progetti recenti\",\"type_a_path_instead\":\"Digita un percorso invece\",\"up\":\"Su\",\"use_recent_project\":\"Usa il progetto recente {{path}}\",\"use_this_folder\":\"Usa questa cartella\",\"use_this_folder_path\":\"Usa questa cartella: {{path}}\",\"load_failed\":\"Impossibile elencare questa cartella\",\"load_failed_unknown\":\"La lettura non è riuscita senza indicare un motivo.\",\"retry\":\"Riprova\"},\"settingsModal\":{\"cancel\":\"Annulla\",\"couldn_t_load_these_settings\":\"Impossibile caricare queste impostazioni: il salvataggio è disattivato finché non vengono caricate.\",\"couldn_t_save_these_settings\":\"Impossibile salvare queste impostazioni.\",\"default_keeps_the_model_your_chat_agent_resolves\":\"Predefinito mantiene il modello già risolto dal tuo agente di chat. Una scelta vale per le sessioni di spec avviate dopo la modifica — una spec in corso mantiene il modello attuale.\",\"empty_keep_specs_with_each_project_recommended\":\"Vuoto = mantieni le spec insieme a ciascun progetto (consigliato)\",\"leave_this_empty_to_keep_specs_inside_each_proje\":\"Lascia vuoto per mantenere le spec all'interno di ciascun progetto (una cartella .kiro/specs accanto al codice: lo standard di Kiro). Oppure indica il percorso di una cartella per raccogliere tutte le spec in un unico posto.\",\"model_default_inherit\":\"Predefinito (eredita)\",\"save\":\"Salva\",\"saving\":\"Salvataggio…\",\"settings\":\"Impostazioni\",\"spec_generation_model\":\"Modello per la generazione delle spec\",\"spec_storage_folder_path\":\"Percorso della cartella di archiviazione delle spec\",\"where_should_specs_be_saved\":\"Dove salvare le spec?\",\"which_model_should_run_spec_generation\":\"Quale modello deve eseguire la generazione delle spec?\"},\"shimmer\":{\"loading_specs\":\"Caricamento delle spec…\",\"loading_the_conversation\":\"Caricamento della conversazione…\",\"writing_this_document\":\"Scrittura di questo documento…\"},\"specDetail\":{\"advance_to_design\":\"Approva → Progettazione\",\"advance_to_tasks\":\"Approva → Attività\",\"an_agent_will_work_through_the_task_list\":\"Un agente lavorerà sull'elenco delle attività\",\"approved\":\"Approvato\",\"approved_by_user\":\"Approvato da {{user}}\",\"archive_this_spec\":\"Archivia questa spec\",\"cancel\":\"Annulla\",\"changed_since_approval\":\"Cambiato dopo l’approvazione\",\"clear\":\"Svuota\",\"close_esc\":\"Chiudi (Esc)\",\"close_review_view\":\"Chiudi la vista di revisione\",\"couldn_t_remove_this_spec_try_again\":\"Impossibile rimuovere questa specifica — riprova.\",\"delete_spec_named\":\"Rimuovi la specifica {{name}}\",\"delete_this_spec\":\"Rimuovi questa specifica\",\"document_file_name\":\"{{name}}.md\",\"drafting_design\":\"Redazione del design…\",\"drafting_tasks\":\"Redazione delle attività…\",\"drag_or_use_to_resize\":\"Trascina o usa ← → per ridimensionare\",\"duplicate_this_spec\":\"Duplica questa spec\",\"expand_document_for_review\":\"Ingrandisci il documento per la revisione\",\"expand_for_review_esc_to_close\":\"Ingrandisci per revisionare (Esc per chiudere)\",\"name_for_the_copy\":\"Nome della copia\",\"pause\":\"Metti in pausa\",\"pausing\":\"Messa in pausa…\",\"pending_comment_many\":\"{{count}} commenti in attesa\",\"pending_comment_one\":\"{{count}} commento in attesa\",\"pending_comment_other\":\"{{count}} commenti in attesa\",\"remove_comment_on\":\"Rimuovi il commento su {{document}}\",\"remove_spec_body\":\"“{{name}}” lascerà Spec Builder. I file markdown restano nel progetto e qualsiasi agente in esecuzione per questa specifica verrà interrotto.\",\"remove_this_spec\":\"Rimuovere questa specifica?\",\"removing\":\"Rimozione…\",\"rename_this_spec_label_the_folder_name_stays\":\"Rinomina l’etichetta di questa spec. La cartella e il branch mantengono lo stesso nome.\",\"resize_document_panel\":\"Ridimensiona il pannello del documento\",\"restore_this_spec\":\"Ripristina questa spec\",\"review_document_named\":\"Rivedi {{document}}.md di {{name}}\",\"send_all_to_agent\":\"Invia tutto all'agente\",\"sending\":\"Invio…\",\"spec_label\":\"Etichetta della spec\",\"start_building\":\"Inizia a costruire\",\"starting\":\"Avvio…\",\"tab_design\":\"Progettazione\",\"tab_requirements\":\"Requisiti\",\"tab_tasks\":\"Attività\",\"tells_the_agent_this_phase_is_approved_and_to_mo\":\"Registra la tua approvazione di questa versione e poi dice all’agente di proseguire\",\"the_agent_is_writing_the_next_document\":\"Approvato — l’agente sta scrivendo il documento successivo\",\"this_document_changed_after_it_was_approved\":\"Questo documento è cambiato dopo essere stato approvato\",\"working\":\"al lavoro…\"},\"specRail\":{\"active\":\"ATTIVI\",\"agent_working\":\"agente al lavoro\",\"an_agent_is_working\":\"Un agente sta lavorando\",\"filter_specs\":\"Filtra le spec\",\"filter_specs_by_name\":\"Filtra le spec per nome\",\"new_spec\":\"Nuova spec\",\"plan_ready\":\"PIANO PRONTO\",\"settings\":\"Impostazioni\",\"show_spec_list\":\"Mostra l'elenco delle spec\",\"show_specs\":\"Mostra le spec\",\"spec_builder\":\"Spec Builder\",\"spec_builder_settings\":\"Impostazioni di Spec Builder\",\"specs\":\"SPEC\",\"v\":\"v\"},\"specStatePanel\":{\"answer_option\":\"Rispondi a “{{title}}” con {{option}}\",\"answer_option_recommended\":\"Rispondi a “{{title}}” con {{option}} (consigliato)\",\"answered\":\"risposta\",\"blocking\":\"BLOCCO\",\"context\":\"CONTESTO\",\"decision_title\":\"Decisione — {{title}}\",\"decisions\":\"DECISIONI\",\"options_for\":\"Opzioni per {{title}}\",\"pending\":\"in attesa\",\"recommended\":\"CONSIGLIATO\",\"sending\":\"invio…\",\"template\":\"Modello\",\"tool_calls\":\"Chiamate a strumenti\",\"turns\":\"Turni\",\"worktree\":\"Worktree\"},\"taskList\":{\"done\":\"Completata\",\"no_tasks_yet\":\"Ancora nessuna attività. Dopo l’approvazione della progettazione, l’elenco ordinato delle attività comparirà qui e potrai eseguirle una alla volta.\",\"pause_the_build_first\":\"Metti in pausa la costruzione prima di eseguire una singola attività\",\"run\":\"Esegui\",\"run_only_this_task_and_stop\":\"Esegui solo questa attività, poi fermati\",\"run_task\":\"Esegui l’attività: {{task}}\",\"starting\":\"Avvio…\",\"task_progress\":\"Avanzamento delle attività\",\"done_of_total_one\":\"Attività completate: {{done}}/{{total}}\",\"done_of_total_many\":\"Attività completate: {{done}}/{{total}}\",\"done_of_total_other\":\"Attività completate: {{done}}/{{total}}\"},\"workspace\":{\"describe_what_you_want_to_build_answer_a_few_que\":\"Descrivi cosa vuoi costruire, rispondi a qualche domanda e ottieni un piano revisionato — requisiti, progettazione e attività — che un agente può realizzare.\",\"pick_a_spec_to_continue_where_you_left_off\":\"Scegli una spec per riprendere da dove avevi interrotto\",\"plan_your_next_feature_with_a_spec\":\"Pianifica la prossima funzionalità con una spec\",\"resize_spec_list\":\"Ridimensiona l'elenco delle spec\",\"start_your_first_spec\":\"Crea la tua prima spec\"}},\"manifest\":{\"description\":\"Sviluppo guidato dalle spec dentro Kiro Crew: trasforma l’idea di una funzionalità in Requisiti → Progettazione → Attività con un agente integrato, rivedi il markdown nell’app e poi affida il piano approvato a una sessione di esecuzione autonoma.\",\"display_name\":\"Spec Builder\",\"page_label\":\"Spec Builder\",\"use_case_1\":\"Trasforma una funzionalità, un bug o un'attività rapida in requisiti, progettazione e passaggi di implementazione legati al repository e pronti da revisionare.\",\"configuration_1\":\"Scegli una cartella di progetto e la modalità Feature, Bug o Quick, crea facoltativamente un nuovo worktree, quindi revisiona e approva ogni fase generata prima di avviare la build.\"},\"specBuilderPage\":{\"spec_builder\":\"Spec Builder\",\"talk_through_an_idea_review_the_plan_then_let_an\":\"Discuti un'idea, rivedi il piano e poi lascia che un agente la realizzi.\"}},\"issueRadar\":{\"components\":{\"detailOverflowMenu\":{\"more_actions\":\"Altre azioni\"}}},\"meetings\":{\"review\":{\"archivedSection\":\"Archiviate\"}}}"),
		components: {
			"ui": {
				"no_noun_match": "Nessun(a) {{noun}} corrispondente",
				"no_matches_for": "Nessuna corrispondenza per",
				"clear_filter": "Cancella filtro"
			},
			"resizeHandle": { "drag_to_resize": "Trascina per ridimensionare" }
		}
	},
	ja: {
		apps: /* @__PURE__ */ JSON.parse("{\"specBuilder\":{\"api\":{\"phase_building\":\"構築中\",\"phase_design\":\"設計\",\"phase_new\":\"開始したばかり\",\"phase_ready\":\"準備完了\",\"phase_requirements\":\"要件\",\"phase_tasks\":\"計画準備完了\",\"something_went_wrong\":\"問題が発生しました ({{status}})\"},\"components\":{\"chatColumn\":{\"reply_to_the_spec_agent\":\"Spec エージェントに返信…\"},\"columnSplitter\":{\"drag_or_use_to_resize\":\"ドラッグするか、← → を使用してサイズを変更します\"},\"docView\":{\"add_comment\":\"コメントを追加\",\"comment\":\"コメント\",\"comment_on_the_selected_passage\":\"選択したテキストにコメント\",\"discard_this_comment\":\"このコメントを破棄\",\"document_file_name\":\"{{name}}.md\",\"empty_design\":\"設計はまだありません。会話で要件を承認すると、技術的な設計がここに表示されます。\",\"empty_requirements\":\"要件はまだ書き込まれていません — 会話で何が必要かを説明すると、エージェントがこのドキュメントを作成します。\",\"empty_tasks\":\"タスクリストはまだありません。設計を承認すると、順序付けられたタスクリストがここに表示されます。\",\"nothing_here_yet\":\"まだ何もありません。\",\"your_feedback_on_the_passage_in\":\"{{document}} の選択したテキストに関するフィードバック\",\"your_feedback_on_this_passage_enter_adds_it_to_t\":\"このテキストに対するフィードバック… (Enter キーでスタックに追加)\"},\"newSpecView\":{\"describe_what_you_want_to_do\":\"何をしたいのかを説明します\",\"e_g_add_login_with_google_so_users_don_t_need_pa\":\"例: 「Google でログインを追加して、ユーザーがパスワードを必要としないようにする」または「エクスポートボタンは大きなファイルでクラッシュします」\",\"fresh_worktree_option_pick_a_project_folder_abov\":\"Fresh-worktree オプション: 上記でプロジェクトフォルダーを選択します — Git リポジトリの場合、メインチェックアウトを変更しないように、専用の worktree で計画および構築できます。\",\"keeps_your_main_checkout_untouched_branch\":\"メインチェックアウトを変更しません: ブランチ {{branch}} をリポジトリの横の独自のフォルダーに作成し、そこで計画と構築を行います。\",\"let_s_plan_something\":\"何かを計画しましょう\",\"never_mind\":\"気にしないでください\",\"settings\":\"設定\",\"start_the_conversation\":\"会話を始める →\",\"starting\":\"開始中…\",\"tell_me_what_you_have_in_mind_i_ll_ask_a_few_cla\":\"どんなことを実現したいのか教えてください。チャットでいくつか質問をして、確認できるプランを書き、\\n          準備ができたら実装します。\",\"this_folder_isn_t_a_git_repository_so_i_ll_work\":\"このフォルダーはGitリポジトリではないので、ここで直接作業します。Gitリポジトリを選択すると、新しいワークツリーのオプションが使えます（メインのチェックアウトそのままで作業できます）。\",\"this_spec_will_be_called\":\"このスペックの名前は {{name}} になります\",\"type_bug_blurb\":\"問題を調査し、根本原因を特定して、修正計画を立てます。\",\"type_bug_title\":\"バグを修正\",\"type_feature_blurb\":\"完全なプラン：要件、技術設計、タスクリスト。\",\"type_feature_title\":\"新しいものを作成\",\"type_quick_blurb\":\"形式的な手続きは省略 — ゴールとタスクリストだけ。\",\"type_quick_title\":\"クイックプラン\",\"what_do_you_want_to_do\":\"何をしたいですか？\",\"what_kind_of_work_is_it\":\"どんな種類の作業ですか？\",\"which_project_is_this_for\":\"このプロジェクトはどれですか？\",\"work_in_a_fresh_worktree\":\"新しいワークツリーで作業\",\"your_plan_is_saved_as_plain_markdown_inside_your\":\"プランはプロジェクト内のプレーンMarkdownファイルとして保存されます（.kiro/specs）。Kiro IDEとCLIでも使用できます。スペックの保存場所は\"},\"projectPicker\":{\"browse\":\"参照\",\"change\":\"変更\",\"choose_a_project_folder\":\"プロジェクトフォルダーを選択…\",\"choose_a_project_folder_aria\":\"プロジェクトフォルダーを選択\",\"go_to_parent_folder\":\"親フォルダーに移動\",\"hide_path_input\":\"パス入力を非表示\",\"home_you_projects_my_app\":\"/home/you/projects/my-app\",\"loading\":\"読み込み中…\",\"no_subfolders_here_use_use_this_folder_above_to\":\"ここにはサブフォルダーがありません — 上記の「このフォルダーを使用」でこのフォルダーを選択してください。\",\"open_folder\":\"フォルダー {{name}} を開く\",\"project_folder_change\":\"プロジェクトフォルダー：{{path}} — 変更\",\"project_folder_path\":\"プロジェクトフォルダーのパス\",\"recent_projects\":\"最近のプロジェクト\",\"type_a_path_instead\":\"代わりにパスを入力\",\"up\":\"上へ\",\"use_recent_project\":\"最近のプロジェクト {{path}} を使用\",\"use_this_folder\":\"このフォルダーを使用\",\"use_this_folder_path\":\"このフォルダーを使用：{{path}}\",\"load_failed\":\"このフォルダーの一覧を取得できませんでした\",\"load_failed_unknown\":\"理由が示されないまま読み込みに失敗しました。\",\"retry\":\"再試行\"},\"settingsModal\":{\"cancel\":\"キャンセル\",\"couldn_t_load_these_settings\":\"これらの設定を読み込めなかったため、読み込めるまで保存はできません。\",\"couldn_t_save_these_settings\":\"これらの設定を保存できませんでした。\",\"default_keeps_the_model_your_chat_agent_resolves\":\"デフォルトでは、チャットエージェントが解決するモデルをそのまま使います。選択したモデルは、変更後に開始するスペックセッションに適用されます。進行中のスペックは現在のモデルを使い続けます。\",\"empty_keep_specs_with_each_project_recommended\":\"空 = 各プロジェクトでスペックを保持（推奨）\",\"leave_this_empty_to_keep_specs_inside_each_proje\":\"空のままにして、各プロジェクト内にスペックを保持します（コードの横の .kiro/specs フォルダー — Kiro 標準）。\\n        または、フォルダーパスを設定してすべてのスペックを一か所に集めてください。\",\"model_default_inherit\":\"デフォルト（継承）\",\"save\":\"保存\",\"saving\":\"保存中…\",\"settings\":\"設定\",\"spec_generation_model\":\"スペック生成モデル\",\"spec_storage_folder_path\":\"スペック保存フォルダーのパス\",\"where_should_specs_be_saved\":\"スペックはどこに保存しますか？\",\"which_model_should_run_spec_generation\":\"スペック生成にはどのモデルを使いますか？\"},\"shimmer\":{\"loading_specs\":\"スペック読み込み中…\",\"loading_the_conversation\":\"会話読み込み中…\",\"writing_this_document\":\"このドキュメント作成中…\"},\"specDetail\":{\"advance_to_design\":\"承認 → デザイン\",\"advance_to_tasks\":\"承認 → タスク\",\"an_agent_will_work_through_the_task_list\":\"エージェントがタスクリストを処理します\",\"approved\":\"承認済み\",\"approved_by_user\":\"{{user}} が承認\",\"archive_this_spec\":\"このスペックをアーカイブ\",\"cancel\":\"キャンセル\",\"changed_since_approval\":\"承認後に変更あり\",\"clear\":\"クリア\",\"close_esc\":\"閉じる（Esc）\",\"close_review_view\":\"レビュービューを閉じる\",\"couldn_t_remove_this_spec_try_again\":\"このスペックを除去できませんでした。もう一度お試しください。\",\"delete_spec_named\":\"スペック {{name}} を除去\",\"delete_this_spec\":\"このスペックを除去\",\"document_file_name\":\"{{name}}.md\",\"drafting_design\":\"設計を作成中…\",\"drafting_tasks\":\"タスクを作成中…\",\"drag_or_use_to_resize\":\"ドラッグまたは ← → を使用してサイズ変更\",\"duplicate_this_spec\":\"このスペックを複製\",\"expand_document_for_review\":\"ドキュメントを展開してレビュー\",\"expand_for_review_esc_to_close\":\"レビュー用に展開（Esc で閉じる）\",\"name_for_the_copy\":\"コピーの名前\",\"pause\":\"一時停止\",\"pausing\":\"一時停止中…\",\"pending_comment_other\":\"{{count}} 件の保留中のコメント\",\"remove_comment_on\":\"{{document}} のコメントを削除\",\"remove_spec_body\":\"「{{name}}」は Spec Builder から削除されます。マークダウンファイルはプロジェクトに残り、このスペックで実行中のエージェントは停止します。\",\"remove_this_spec\":\"このスペックを削除しますか？\",\"removing\":\"削除中…\",\"rename_this_spec_label_the_folder_name_stays\":\"このスペックのラベルを変更します。フォルダー名とブランチ名はそのままです。\",\"resize_document_panel\":\"ドキュメントパネルのサイズ変更\",\"restore_this_spec\":\"このスペックを復元\",\"review_document_named\":\"{{name}} の {{document}}.md を確認\",\"send_all_to_agent\":\"すべてをエージェントに送信\",\"sending\":\"送信中…\",\"spec_label\":\"スペックのラベル\",\"start_building\":\"ビルド開始\",\"starting\":\"開始中…\",\"tab_design\":\"デザイン\",\"tab_requirements\":\"要件\",\"tab_tasks\":\"タスク\",\"tells_the_agent_this_phase_is_approved_and_to_mo\":\"この版への承認を記録し、エージェントに次へ進むよう伝えます\",\"the_agent_is_writing_the_next_document\":\"承認済み — エージェントが次のドキュメントを作成しています\",\"this_document_changed_after_it_was_approved\":\"このドキュメントは承認後に変更されました\",\"working\":\"処理中…\"},\"specRail\":{\"active\":\"進行中\",\"agent_working\":\"エージェント処理中\",\"an_agent_is_working\":\"エージェントが処理中です\",\"filter_specs\":\"スペックをフィルタリング\",\"filter_specs_by_name\":\"スペックを名前でフィルタリング\",\"new_spec\":\"新しいスペック\",\"plan_ready\":\"プラン完了\",\"settings\":\"設定\",\"show_spec_list\":\"スペックリストを表示\",\"show_specs\":\"スペックを表示\",\"spec_builder\":\"Spec Builder\",\"spec_builder_settings\":\"Spec Builder設定\",\"specs\":\"スペック\",\"v\":\"v\"},\"specStatePanel\":{\"answer_option\":\"「{{title}}」に「{{option}}」で回答\",\"answer_option_recommended\":\"「{{title}}」に「{{option}}」で回答（推奨）\",\"answered\":\"回答済み\",\"blocking\":\"ブロッカー\",\"context\":\"コンテキスト\",\"decision_title\":\"決定 — {{title}}\",\"decisions\":\"決定事項\",\"options_for\":\"{{title}} のオプション\",\"pending\":\"保留中\",\"recommended\":\"推奨\",\"sending\":\"送信中…\",\"template\":\"テンプレート\",\"tool_calls\":\"ツール呼び出し\",\"turns\":\"ターン\",\"worktree\":\"ワークツリー\"},\"taskList\":{\"done\":\"完了\",\"no_tasks_yet\":\"タスクはまだありません。設計を承認すると、順序付けられたタスクリストがここに表示され、1 件ずつ実行できます。\",\"pause_the_build_first\":\"1 件だけ実行する前にビルドを一時停止してください\",\"run\":\"実行\",\"run_only_this_task_and_stop\":\"このタスクだけを実行して停止します\",\"run_task\":\"タスクを実行：{{task}}\",\"starting\":\"開始中…\",\"task_progress\":\"タスクの進捗\",\"done_of_total_other\":\"{{total}} 件中 {{done}} 件完了\"},\"workspace\":{\"describe_what_you_want_to_build_answer_a_few_que\":\"作成したいことを説明し、いくつかの質問に答えて、確認済みのプラン — 要件、デザイン、タスク — を取得すれば、エージェントがそれを実行できます。\",\"pick_a_spec_to_continue_where_you_left_off\":\"スペックを選択して前回の続きから開始\",\"plan_your_next_feature_with_a_spec\":\"スペックで次の機能を計画\",\"resize_spec_list\":\"スペックリストのサイズ変更\",\"start_your_first_spec\":\"最初のスペックを作成\"}},\"manifest\":{\"use_case_1\":\"機能、不具合、クイックタスクを、リポジトリの文脈に沿ったレビュー可能な要件、設計、実装手順に変換します。\",\"configuration_1\":\"プロジェクトフォルダーと Feature、Bug、Quick のいずれかのモードを選び、必要に応じて新しいワークツリーを作成します。その後、ビルドを開始する前に生成された各段階を確認して承認します。\",\"description\":\"Kiro Crew内でのスペック駆動開発：機能のアイデアを「要件 → デザイン → タスク」に変換。組み込みエージェント付き、アプリ内でMarkdownを確認し、承認済みプランを自動実行セッションに引き渡します。\",\"display_name\":\"Spec Builder\",\"page_label\":\"Spec Builder\"},\"specBuilderPage\":{\"spec_builder\":\"Spec Builder\",\"talk_through_an_idea_review_the_plan_then_let_an\":\"アイデアについて話し合い、プランを確認してからエージェントに実装させます。\"}},\"issueRadar\":{\"components\":{\"detailOverflowMenu\":{\"more_actions\":\"その他の操作\"}}},\"meetings\":{\"review\":{\"archivedSection\":\"アーカイブ済み\"}}}"),
		components: {
			"ui": {
				"no_noun_match": "{{noun}}に一致しません",
				"no_matches_for": "一致しません:",
				"clear_filter": "フィルターをクリア"
			},
			"resizeHandle": { "drag_to_resize": "ドラッグしてサイズを変更" }
		}
	},
	ko: {
		apps: /* @__PURE__ */ JSON.parse("{\"specBuilder\":{\"api\":{\"phase_building\":\"구축 중\",\"phase_design\":\"설계\",\"phase_new\":\"막 시작\",\"phase_ready\":\"준비됨\",\"phase_requirements\":\"요구사항\",\"phase_tasks\":\"계획 준비됨\",\"something_went_wrong\":\"문제가 발생했습니다 ({{status}})\"},\"components\":{\"chatColumn\":{\"reply_to_the_spec_agent\":\"Spec 에이전트에게 답장…\"},\"columnSplitter\":{\"drag_or_use_to_resize\":\"드래그하거나 ← →로 크기 조절\"},\"docView\":{\"add_comment\":\"코멘트 추가\",\"comment\":\"코멘트\",\"comment_on_the_selected_passage\":\"선택한 구절에 코멘트\",\"discard_this_comment\":\"이 코멘트 버리기\",\"document_file_name\":\"{{name}}.md\",\"empty_design\":\"아직 설계가 없습니다. 대화에서 요구사항을 승인하면 기술 설계가 여기에 표시됩니다.\",\"empty_requirements\":\"아직 작성된 요구사항이 없습니다 — 대화에서 원하는 것을 설명하면 에이전트가 이 문서를 작성합니다.\",\"empty_tasks\":\"아직 작업 목록이 없습니다. 설계를 승인하면 순서가 정해진 작업 목록이 여기에 표시됩니다.\",\"nothing_here_yet\":\"아직 아무것도 없습니다.\",\"your_feedback_on_the_passage_in\":\"{{document}}에서 선택한 구절에 대한 피드백\",\"your_feedback_on_this_passage_enter_adds_it_to_t\":\"이 구절에 대한 피드백… (Enter로 스택에 추가)\"},\"newSpecView\":{\"describe_what_you_want_to_do\":\"하고 싶은 일을 설명하세요\",\"e_g_add_login_with_google_so_users_don_t_need_pa\":\"예: ‘Google 로그인을 추가해 사용자가 비밀번호를 쓰지 않게 하기’ 또는 ‘내보내기 버튼이 큰 파일에서 충돌합니다’\",\"fresh_worktree_option_pick_a_project_folder_abov\":\"새 워크트리 옵션: 위에서 프로젝트 폴더를 선택하세요 — git 저장소라면 전용 워크트리에서 계획하고 구축해 메인 체크아웃을 그대로 둘 수 있습니다.\",\"keeps_your_main_checkout_untouched_branch\":\"메인 체크아웃을 그대로 둡니다: 저장소 옆의 별도 폴더에 브랜치 {{branch}}을(를) 만들고 거기서 계획하고 구축합니다.\",\"let_s_plan_something\":\"무언가를 계획해 봅시다\",\"never_mind\":\"괜찮습니다\",\"settings\":\"설정\",\"start_the_conversation\":\"대화 시작 →\",\"starting\":\"시작 중…\",\"tell_me_what_you_have_in_mind_i_ll_ask_a_few_cla\":\"생각하고 있는 것을 알려주세요. 채팅에서 몇 가지 확인 질문을 하고, 검토할 수 있는 계획을 작성한 뒤,\\n 준비되면 구축합니다.\",\"this_folder_isn_t_a_git_repository_so_i_ll_work\":\"이 폴더는 git 저장소가 아니므로 여기서 바로 작업합니다. git 저장소를 선택하면 새 워크트리 옵션을 쓸 수 있습니다(메인 체크아웃을 그대로 둡니다).\",\"this_spec_will_be_called\":\"이 스펙 이름은 {{name}}입니다\",\"type_bug_blurb\":\"문제를 조사하고 근본 원인을 찾아 수정 계획을 세웁니다.\",\"type_bug_title\":\"버그 수정\",\"type_feature_blurb\":\"완전한 계획: 요구사항·기술 설계·작업 목록.\",\"type_feature_title\":\"새로운 것 만들기\",\"type_quick_blurb\":\"형식은 건너뛰고 — 목표와 작업 목록만.\",\"type_quick_title\":\"빠른 계획\",\"what_do_you_want_to_do\":\"무엇을 하고 싶으신가요?\",\"what_kind_of_work_is_it\":\"어떤 종류의 작업인가요?\",\"which_project_is_this_for\":\"어떤 프로젝트를 위한 작업인가요?\",\"work_in_a_fresh_worktree\":\"새 워크트리에서 작업\",\"your_plan_is_saved_as_plain_markdown_inside_your\":\"계획은 프로젝트 안에 일반 Markdown으로 저장되므로(.kiro/specs) Kiro IDE와 CLI에서도 사용할 수 있습니다. 스펙 저장 위치는 다음에서 변경할 수 있습니다\"},\"projectPicker\":{\"browse\":\"찾아보기\",\"change\":\"변경\",\"choose_a_project_folder\":\"프로젝트 폴더를 선택하세요…\",\"choose_a_project_folder_aria\":\"프로젝트 폴더 선택\",\"go_to_parent_folder\":\"상위 폴더로 이동\",\"hide_path_input\":\"경로 입력 숨기기\",\"home_you_projects_my_app\":\"/home/you/projects/my-app\",\"loading\":\"불러오는 중…\",\"no_subfolders_here_use_use_this_folder_above_to\":\"여기에는 하위 폴더가 없습니다 — 위의 ‘이 폴더 사용’으로 이 폴더를 선택하세요.\",\"open_folder\":\"{{name}} 폴더 열기\",\"project_folder_change\":\"프로젝트 폴더: {{path}} — 변경\",\"project_folder_path\":\"프로젝트 폴더 경로\",\"recent_projects\":\"최근 프로젝트\",\"type_a_path_instead\":\"대신 경로 입력\",\"up\":\"상위 폴더\",\"use_recent_project\":\"최근 프로젝트 {{path}} 사용\",\"use_this_folder\":\"이 폴더 사용\",\"use_this_folder_path\":\"이 폴더 사용: {{path}}\",\"load_failed\":\"이 폴더의 목록을 불러올 수 없습니다\",\"load_failed_unknown\":\"이유 없이 읽기에 실패했습니다.\",\"retry\":\"다시 시도\"},\"settingsModal\":{\"cancel\":\"취소\",\"couldn_t_load_these_settings\":\"이 설정을 불러오지 못해, 불러올 때까지 저장할 수 없습니다.\",\"couldn_t_save_these_settings\":\"이 설정을 저장하지 못했습니다.\",\"default_keeps_the_model_your_chat_agent_resolves\":\"기본값은 채팅 에이전트가 해석하는 모델을 그대로 사용합니다. 선택한 모델은 변경 이후 시작되는 스펙 세션에 적용되며, 진행 중인 스펙은 현재 모델을 유지합니다.\",\"empty_keep_specs_with_each_project_recommended\":\"비움 = 각 프로젝트에 스펙 보관(권장)\",\"leave_this_empty_to_keep_specs_inside_each_proje\":\"비워 두면 각 프로젝트 안에 스펙을 보관합니다(코드 옆의 .kiro/specs 폴더 — Kiro 표준).\\n 또는 폴더 경로를 설정해 모든 스펙을 한곳에 모을 수 있습니다.\",\"model_default_inherit\":\"기본값(상속)\",\"save\":\"저장\",\"saving\":\"저장 중…\",\"settings\":\"설정\",\"spec_generation_model\":\"스펙 생성 모델\",\"spec_storage_folder_path\":\"스펙 저장 폴더 경로\",\"where_should_specs_be_saved\":\"스펙을 어디에 저장할까요?\",\"which_model_should_run_spec_generation\":\"스펙 생성에 어떤 모델을 사용할까요?\"},\"shimmer\":{\"loading_specs\":\"스펙 불러오는 중…\",\"loading_the_conversation\":\"대화 불러오는 중…\",\"writing_this_document\":\"이 문서 작성 중…\"},\"specDetail\":{\"advance_to_design\":\"승인 → 설계\",\"advance_to_tasks\":\"승인 → 작업\",\"an_agent_will_work_through_the_task_list\":\"에이전트가 작업 목록을 처리합니다\",\"approved\":\"승인됨\",\"approved_by_user\":\"{{user}}이(가) 승인\",\"archive_this_spec\":\"이 스펙 보관\",\"cancel\":\"취소\",\"changed_since_approval\":\"승인 후 변경됨\",\"clear\":\"지우기\",\"close_esc\":\"닫기(Esc)\",\"close_review_view\":\"검토 화면 닫기\",\"couldn_t_remove_this_spec_try_again\":\"이 스펙을 제거하지 못했습니다. 다시 시도해 주세요.\",\"delete_spec_named\":\"스펙 {{name}} 제거\",\"delete_this_spec\":\"이 스펙 제거\",\"document_file_name\":\"{{name}}.md\",\"drafting_design\":\"설계 작성 중…\",\"drafting_tasks\":\"작업 작성 중…\",\"drag_or_use_to_resize\":\"드래그하거나 ← →로 크기 조절\",\"duplicate_this_spec\":\"이 스펙 복제\",\"expand_document_for_review\":\"검토를 위해 문서 확대\",\"expand_for_review_esc_to_close\":\"검토를 위해 확대(Esc로 닫기)\",\"name_for_the_copy\":\"사본 이름\",\"pause\":\"일시 중지\",\"pausing\":\"일시 중지 중…\",\"pending_comment_other\":\"보류 중인 코멘트 {{count}}개\",\"remove_comment_on\":\"{{document}}의 코멘트 삭제\",\"remove_spec_body\":\"‘{{name}}’이(가) Spec Builder에서 제거됩니다. 마크다운 파일은 프로젝트에 남고, 이 스펙에서 실행 중인 에이전트는 중지됩니다.\",\"remove_this_spec\":\"이 스펙을 제거하시겠습니까?\",\"removing\":\"제거 중…\",\"rename_this_spec_label_the_folder_name_stays\":\"이 스펙의 라벨을 바꿉니다. 폴더 이름과 브랜치 이름은 그대로입니다.\",\"resize_document_panel\":\"문서 패널 크기 조절\",\"restore_this_spec\":\"이 스펙 복원\",\"review_document_named\":\"{{name}}의 {{document}}.md 검토\",\"send_all_to_agent\":\"전체를 에이전트에게 보내기\",\"sending\":\"보내는 중…\",\"spec_label\":\"스펙 라벨\",\"start_building\":\"구축 시작\",\"starting\":\"시작 중…\",\"tab_design\":\"설계\",\"tab_requirements\":\"요구사항\",\"tab_tasks\":\"작업\",\"tells_the_agent_this_phase_is_approved_and_to_mo\":\"이 버전에 대한 승인을 기록한 뒤 에이전트에게 다음 단계로 넘어가라고 알립니다\",\"the_agent_is_writing_the_next_document\":\"승인됨 — 에이전트가 다음 문서를 작성하고 있습니다\",\"this_document_changed_after_it_was_approved\":\"이 문서는 승인된 뒤에 변경되었습니다\",\"working\":\"처리 중…\"},\"specRail\":{\"active\":\"진행 중\",\"agent_working\":\"에이전트 처리 중\",\"an_agent_is_working\":\"에이전트가 처리하고 있습니다\",\"filter_specs\":\"스펙 필터\",\"filter_specs_by_name\":\"이름으로 스펙 필터\",\"new_spec\":\"새 스펙\",\"plan_ready\":\"계획 준비됨\",\"settings\":\"설정\",\"show_spec_list\":\"스펙 목록 표시\",\"show_specs\":\"스펙 표시\",\"spec_builder\":\"Spec Builder\",\"spec_builder_settings\":\"Spec Builder 설정\",\"specs\":\"스펙\",\"v\":\"v\"},\"specStatePanel\":{\"answer_option\":\"‘{{title}}’에 {{option}}(으)로 답하기\",\"answer_option_recommended\":\"‘{{title}}’에 {{option}}(으)로 답하기(권장)\",\"answered\":\"응답됨\",\"blocking\":\"차단 요소\",\"context\":\"컨텍스트\",\"decision_title\":\"결정 — {{title}}\",\"decisions\":\"결정 사항\",\"options_for\":\"{{title}} 옵션\",\"pending\":\"대기 중\",\"recommended\":\"권장\",\"sending\":\"전송 중…\",\"template\":\"템플릿\",\"tool_calls\":\"도구 호출\",\"turns\":\"턴\",\"worktree\":\"워크트리\"},\"taskList\":{\"done\":\"완료\",\"no_tasks_yet\":\"아직 작업이 없습니다. 설계를 승인하면 순서가 정해진 작업 목록이 여기에 표시되고, 하나씩 실행할 수 있습니다.\",\"pause_the_build_first\":\"작업 하나만 실행하려면 먼저 구축을 일시 중지하세요\",\"run\":\"실행\",\"run_only_this_task_and_stop\":\"이 작업만 실행한 뒤 멈춥니다\",\"run_task\":\"작업 실행: {{task}}\",\"starting\":\"시작 중…\",\"task_progress\":\"작업 진행률\",\"done_of_total_other\":\"{{total}}개 중 {{done}}개 완료\"},\"workspace\":{\"describe_what_you_want_to_build_answer_a_few_que\":\"만들고 싶은 것을 설명하고 몇 가지 질문에 답하면, 에이전트가 실행할 수 있는 검토된 계획 — 요구사항·설계·작업 — 을 받습니다.\",\"pick_a_spec_to_continue_where_you_left_off\":\"스펙을 선택해 중단한 곳에서 계속하세요\",\"plan_your_next_feature_with_a_spec\":\"스펙으로 다음 기능을 계획하세요\",\"resize_spec_list\":\"스펙 목록 크기 조절\",\"start_your_first_spec\":\"첫 스펙 시작\"}},\"manifest\":{\"use_case_1\":\"기능, 버그 또는 빠른 작업을 저장소 맥락을 반영한 검토 가능한 요구 사항, 설계, 구현 단계로 바꿉니다.\",\"configuration_1\":\"프로젝트 폴더와 Feature, Bug 또는 Quick 모드를 선택하고 필요하면 새 워크트리를 만드세요. 빌드를 시작하기 전에 생성된 각 단계를 검토하고 승인하세요.\",\"description\":\"Kiro Crew 안에서의 스펙 주도 개발: 내장 에이전트와 함께 기능 아이디어를 요구사항 → 설계 → 작업으로 바꾸고, 앱 안에서 Markdown을 검토한 뒤 승인된 계획을 자율 실행 세션으로 넘깁니다.\",\"display_name\":\"Spec Builder\",\"page_label\":\"Spec Builder\"},\"specBuilderPage\":{\"spec_builder\":\"Spec Builder\",\"talk_through_an_idea_review_the_plan_then_let_an\":\"아이디어를 함께 이야기하고 계획을 검토한 뒤 에이전트가 구축하게 하세요.\"}},\"issueRadar\":{\"components\":{\"detailOverflowMenu\":{\"more_actions\":\"추가 작업\"}}},\"meetings\":{\"review\":{\"archivedSection\":\"보관됨\"}}}"),
		components: {
			"ui": {
				"no_noun_match": "일치하는 {{noun}} 없음",
				"no_matches_for": "일치하는 항목 없음:",
				"clear_filter": "필터 지우기"
			},
			"resizeHandle": { "drag_to_resize": "끌어서 크기 조절" }
		}
	},
	pt: {
		apps: /* @__PURE__ */ JSON.parse("{\"specBuilder\":{\"api\":{\"phase_building\":\"construindo\",\"phase_design\":\"design\",\"phase_new\":\"recém-iniciada\",\"phase_ready\":\"pronta\",\"phase_requirements\":\"requisitos\",\"phase_tasks\":\"plano pronto\",\"something_went_wrong\":\"Algo deu errado ({{status}})\"},\"components\":{\"chatColumn\":{\"reply_to_the_spec_agent\":\"Responder ao agente de Spec…\"},\"columnSplitter\":{\"drag_or_use_to_resize\":\"Arraste ou use ← → para redimensionar\"},\"docView\":{\"add_comment\":\"Adicionar comentário\",\"comment\":\"Comentar\",\"comment_on_the_selected_passage\":\"Comentar o trecho selecionado\",\"discard_this_comment\":\"Descartar este comentário\",\"document_file_name\":\"{{name}}.md\",\"empty_design\":\"Ainda não há design. Depois que você aprovar os requisitos na conversa, o design técnico aparece aqui.\",\"empty_requirements\":\"Nenhum requisito escrito ainda — descreva o que você quer na conversa e o agente vai redigir este documento.\",\"empty_tasks\":\"Ainda não há lista de tarefas. Depois que você aprovar o design, a lista ordenada de tarefas aparece aqui.\",\"nothing_here_yet\":\"Ainda não há nada aqui.\",\"your_feedback_on_the_passage_in\":\"Seu comentário sobre o trecho selecionado em {{document}}\",\"your_feedback_on_this_passage_enter_adds_it_to_t\":\"Seu comentário sobre este trecho… (Enter adiciona à pilha)\"},\"newSpecView\":{\"describe_what_you_want_to_do\":\"Descreva o que você quer fazer\",\"e_g_add_login_with_google_so_users_don_t_need_pa\":\"por ex. “Adicionar login com Google para dispensar senhas” ou “O botão de exportar quebra com arquivos grandes”\",\"fresh_worktree_option_pick_a_project_folder_abov\":\"Opção de worktree novo: escolha uma pasta de projeto acima — se for um repositório git, posso planejar e construir em um worktree dedicado.\",\"keeps_your_main_checkout_untouched_branch\":\"Mantém seu checkout principal intacto: vou criar um branch {{branch}} em uma pasta própria ao lado do repositório, e planejar e construir ali.\",\"let_s_plan_something\":\"Vamos planejar algo\",\"never_mind\":\"Cancelar\",\"settings\":\"Configurações\",\"start_the_conversation\":\"Iniciar a conversa →\",\"starting\":\"Iniciando…\",\"tell_me_what_you_have_in_mind_i_ll_ask_a_few_cla\":\"Conte o que você tem em mente. Vou fazer algumas perguntas de esclarecimento no chat, escrever um plano para você revisar e depois construí-lo quando estiver pronto.\",\"this_folder_isn_t_a_git_repository_so_i_ll_work\":\"Esta pasta não é um repositório git, então vou trabalhar diretamente nela. Escolha um repositório git para ter a opção de um worktree novo.\",\"this_spec_will_be_called\":\"Esta especificação se chamará {{name}}\",\"type_bug_blurb\":\"Investigar o problema, encontrar a causa raiz e planejar a correção.\",\"type_bug_title\":\"Corrigir um bug\",\"type_feature_blurb\":\"Um plano completo: requisitos, design técnico e uma lista de tarefas.\",\"type_feature_title\":\"Construir algo novo\",\"type_quick_blurb\":\"Sem formalidade — apenas um objetivo e uma lista de tarefas.\",\"type_quick_title\":\"Plano rápido\",\"what_do_you_want_to_do\":\"O que você quer fazer?\",\"what_kind_of_work_is_it\":\"Que tipo de trabalho é?\",\"which_project_is_this_for\":\"Para qual projeto é?\",\"work_in_a_fresh_worktree\":\"Trabalhar em um worktree novo\",\"your_plan_is_saved_as_plain_markdown_inside_your\":\"Seu plano é salvo como markdown simples dentro do projeto (.kiro/specs), então também funciona com o IDE Kiro e a CLI. Você pode mudar onde as specs ficam guardadas em\"},\"projectPicker\":{\"browse\":\"Navegar\",\"change\":\"alterar\",\"choose_a_project_folder\":\"Escolher uma pasta de projeto…\",\"choose_a_project_folder_aria\":\"Escolher uma pasta de projeto\",\"go_to_parent_folder\":\"Ir para a pasta acima\",\"hide_path_input\":\"Ocultar o campo de caminho\",\"home_you_projects_my_app\":\"/home/you/projects/my-app\",\"loading\":\"Carregando…\",\"no_subfolders_here_use_use_this_folder_above_to\":\"Nenhuma subpasta aqui — use “Usar esta pasta” acima para escolher esta.\",\"open_folder\":\"Abrir a pasta {{name}}\",\"project_folder_change\":\"Pasta do projeto: {{path}} — alterar\",\"project_folder_path\":\"Caminho da pasta do projeto\",\"recent_projects\":\"Projetos recentes\",\"type_a_path_instead\":\"Digitar um caminho em vez disso\",\"up\":\"Acima\",\"use_recent_project\":\"Usar o projeto recente {{path}}\",\"use_this_folder\":\"Usar esta pasta\",\"use_this_folder_path\":\"Usar esta pasta: {{path}}\",\"load_failed\":\"Não foi possível listar esta pasta\",\"load_failed_unknown\":\"A leitura falhou sem informar o motivo.\",\"retry\":\"Tentar novamente\"},\"settingsModal\":{\"cancel\":\"Cancelar\",\"couldn_t_load_these_settings\":\"Não foi possível carregar estas configurações, então salvar fica desativado até que carreguem.\",\"couldn_t_save_these_settings\":\"Não foi possível salvar estas configurações.\",\"default_keeps_the_model_your_chat_agent_resolves\":\"Padrão mantém o modelo que seu agente de chat já resolve. Uma escolha se aplica às sessões de spec iniciadas após a mudança — uma spec em andamento mantém seu modelo atual.\",\"empty_keep_specs_with_each_project_recommended\":\"Vazio = manter as specs junto a cada projeto (recomendado)\",\"leave_this_empty_to_keep_specs_inside_each_proje\":\"Deixe em branco para manter as specs dentro de cada projeto (uma pasta .kiro/specs ao lado do seu código — o padrão do Kiro). Ou defina um caminho de pasta para reunir todas as specs em um só lugar.\",\"model_default_inherit\":\"Padrão (herdar)\",\"save\":\"Salvar\",\"saving\":\"Salvando…\",\"settings\":\"Configurações\",\"spec_generation_model\":\"Modelo de geração de specs\",\"spec_storage_folder_path\":\"Caminho da pasta de armazenamento das specs\",\"where_should_specs_be_saved\":\"Onde as specs devem ser salvas?\",\"which_model_should_run_spec_generation\":\"Qual modelo deve executar a geração de specs?\"},\"shimmer\":{\"loading_specs\":\"Carregando as specs…\",\"loading_the_conversation\":\"Carregando a conversa…\",\"writing_this_document\":\"Escrevendo este documento…\"},\"specDetail\":{\"advance_to_design\":\"Aprovar → Design\",\"advance_to_tasks\":\"Aprovar → Tarefas\",\"an_agent_will_work_through_the_task_list\":\"Um agente vai percorrer a lista de tarefas\",\"approved\":\"Aprovado\",\"approved_by_user\":\"Aprovado por {{user}}\",\"archive_this_spec\":\"Arquivar esta spec\",\"cancel\":\"Cancelar\",\"changed_since_approval\":\"Mudou depois da aprovação\",\"clear\":\"Limpar\",\"close_esc\":\"Fechar (Esc)\",\"close_review_view\":\"Fechar a visualização de revisão\",\"couldn_t_remove_this_spec_try_again\":\"Não foi possível remover esta especificação — tente novamente.\",\"delete_spec_named\":\"Remover a especificação {{name}}\",\"delete_this_spec\":\"Remover esta especificação\",\"document_file_name\":\"{{name}}.md\",\"drafting_design\":\"Redigindo o design…\",\"drafting_tasks\":\"Redigindo as tarefas…\",\"drag_or_use_to_resize\":\"Arraste ou use ← → para redimensionar\",\"duplicate_this_spec\":\"Duplicar esta spec\",\"expand_document_for_review\":\"Ampliar o documento para revisão\",\"expand_for_review_esc_to_close\":\"Ampliar para revisar (Esc para fechar)\",\"name_for_the_copy\":\"Nome da cópia\",\"pause\":\"Pausar\",\"pausing\":\"Pausando…\",\"pending_comment_many\":\"{{count}} comentários pendentes\",\"pending_comment_one\":\"{{count}} comentário pendente\",\"pending_comment_other\":\"{{count}} comentários pendentes\",\"remove_comment_on\":\"Remover o comentário sobre {{document}}\",\"remove_spec_body\":\"“{{name}}” sairá do Spec Builder. Os arquivos markdown permanecem no projeto, e qualquer agente em execução para esta especificação será interrompido.\",\"remove_this_spec\":\"Remover esta especificação?\",\"removing\":\"Removendo…\",\"rename_this_spec_label_the_folder_name_stays\":\"Renomeie o rótulo desta spec. A pasta e o branch mantêm o mesmo nome.\",\"resize_document_panel\":\"Redimensionar o painel do documento\",\"restore_this_spec\":\"Restaurar esta spec\",\"review_document_named\":\"Revisar {{document}}.md de {{name}}\",\"send_all_to_agent\":\"Enviar tudo ao agente\",\"sending\":\"Enviando…\",\"spec_label\":\"Rótulo da spec\",\"start_building\":\"Começar a construir\",\"starting\":\"Iniciando…\",\"tab_design\":\"Design\",\"tab_requirements\":\"Requisitos\",\"tab_tasks\":\"Tarefas\",\"tells_the_agent_this_phase_is_approved_and_to_mo\":\"Registra a sua aprovação desta versão e depois diz ao agente para seguir adiante\",\"the_agent_is_writing_the_next_document\":\"Aprovado — o agente está escrevendo o próximo documento\",\"this_document_changed_after_it_was_approved\":\"Este documento mudou depois de ser aprovado\",\"working\":\"trabalhando…\"},\"specRail\":{\"active\":\"ATIVOS\",\"agent_working\":\"agente trabalhando\",\"an_agent_is_working\":\"Um agente está trabalhando\",\"filter_specs\":\"Filtrar as specs\",\"filter_specs_by_name\":\"Filtrar as specs por nome\",\"new_spec\":\"Nova spec\",\"plan_ready\":\"PLANO PRONTO\",\"settings\":\"Configurações\",\"show_spec_list\":\"Mostrar a lista de specs\",\"show_specs\":\"Mostrar as specs\",\"spec_builder\":\"Spec Builder\",\"spec_builder_settings\":\"Configurações do Spec Builder\",\"specs\":\"SPECS\",\"v\":\"v\"},\"specStatePanel\":{\"answer_option\":\"Responder “{{title}}” com {{option}}\",\"answer_option_recommended\":\"Responder “{{title}}” com {{option}} (recomendado)\",\"answered\":\"respondida\",\"blocking\":\"BLOQUEIO\",\"context\":\"CONTEXTO\",\"decision_title\":\"Decisão — {{title}}\",\"decisions\":\"DECISÕES\",\"options_for\":\"Opções para {{title}}\",\"pending\":\"pendente\",\"recommended\":\"RECOMENDADO\",\"sending\":\"enviando…\",\"template\":\"Modelo\",\"tool_calls\":\"Chamadas de ferramentas\",\"turns\":\"Turnos\",\"worktree\":\"Worktree\"},\"taskList\":{\"done\":\"Concluída\",\"no_tasks_yet\":\"Ainda não há tarefas. Depois que o design for aprovado, a lista ordenada de tarefas aparece aqui e você pode executá-las uma a uma.\",\"pause_the_build_first\":\"Pause a construção antes de executar uma única tarefa\",\"run\":\"Executar\",\"run_only_this_task_and_stop\":\"Executar apenas esta tarefa e depois parar\",\"run_task\":\"Executar a tarefa: {{task}}\",\"starting\":\"Iniciando…\",\"task_progress\":\"Progresso das tarefas\",\"done_of_total_one\":\"{{done}} de {{total}} tarefa concluída\",\"done_of_total_many\":\"{{done}} de {{total}} tarefas concluídas\",\"done_of_total_other\":\"{{done}} de {{total}} tarefas concluídas\"},\"workspace\":{\"describe_what_you_want_to_build_answer_a_few_que\":\"Descreva o que você quer construir, responda a algumas perguntas e receba um plano revisado — requisitos, design e tarefas — que um agente pode executar.\",\"pick_a_spec_to_continue_where_you_left_off\":\"Escolha uma spec para continuar de onde parou\",\"plan_your_next_feature_with_a_spec\":\"Planeje seu próximo recurso com uma spec\",\"resize_spec_list\":\"Redimensionar a lista de specs\",\"start_your_first_spec\":\"Crie sua primeira spec\"}},\"manifest\":{\"description\":\"Desenvolvimento orientado a specs dentro do Kiro Crew: transforme a ideia de um recurso em Requisitos → Design → Tarefas com um agente integrado, revise o markdown no próprio app e depois entregue o plano aprovado a uma sessão de execução autônoma.\",\"display_name\":\"Spec Builder\",\"page_label\":\"Spec Builder\",\"use_case_1\":\"Transforme um recurso, bug ou tarefa rápida em requisitos, design e etapas de implementação ligados ao repositório e prontos para revisão.\",\"configuration_1\":\"Escolha uma pasta de projeto e o modo Feature, Bug ou Quick, crie opcionalmente um novo worktree e revise e aprove cada etapa gerada antes de iniciar a build.\"},\"specBuilderPage\":{\"spec_builder\":\"Spec Builder\",\"talk_through_an_idea_review_the_plan_then_let_an\":\"Converse sobre uma ideia, revise o plano e deixe um agente construí-la.\"}},\"issueRadar\":{\"components\":{\"detailOverflowMenu\":{\"more_actions\":\"Mais ações\"}}},\"meetings\":{\"review\":{\"archivedSection\":\"Arquivadas\"}}}"),
		components: {
			"ui": {
				"no_noun_match": "Nenhum(a) {{noun}} correspondente",
				"no_matches_for": "Sem correspondências para",
				"clear_filter": "Limpar filtro"
			},
			"resizeHandle": { "drag_to_resize": "Arraste para redimensionar" }
		}
	},
	ru: {
		apps: /* @__PURE__ */ JSON.parse("{\"specBuilder\":{\"api\":{\"phase_building\":\"сборка\",\"phase_design\":\"дизайн\",\"phase_new\":\"только начали\",\"phase_ready\":\"готово\",\"phase_requirements\":\"требования\",\"phase_tasks\":\"план готов\",\"something_went_wrong\":\"Что-то пошло не так ({{status}})\"},\"components\":{\"chatColumn\":{\"reply_to_the_spec_agent\":\"Ответить агенту Spec…\"},\"columnSplitter\":{\"drag_or_use_to_resize\":\"Потяните или используйте ← →, чтобы изменить размер\"},\"docView\":{\"add_comment\":\"Добавить комментарий\",\"comment\":\"Комментировать\",\"comment_on_the_selected_passage\":\"Комментировать выделенный фрагмент\",\"discard_this_comment\":\"Отменить этот комментарий\",\"document_file_name\":\"{{name}}.md\",\"empty_design\":\"Дизайна пока нет. Как только вы согласуете требования в чате, здесь появится технический дизайн.\",\"empty_requirements\":\"Требования пока не написаны — опишите в чате, что вам нужно, и агент подготовит этот документ.\",\"empty_tasks\":\"Списка задач пока нет. После того как вы согласуете дизайн, здесь появится упорядоченный список задач.\",\"nothing_here_yet\":\"Здесь пока ничего нет.\",\"your_feedback_on_the_passage_in\":\"Ваш отзыв о выделенном фрагменте в {{document}}\",\"your_feedback_on_this_passage_enter_adds_it_to_t\":\"Ваш отзыв об этом фрагменте… (Enter добавит его в очередь)\"},\"newSpecView\":{\"describe_what_you_want_to_do\":\"Опишите, что вы хотите сделать\",\"e_g_add_login_with_google_so_users_don_t_need_pa\":\"например: «Добавить вход через Google, чтобы пользователям не нужны были пароли» или «Кнопка экспорта падает на больших файлах»\",\"fresh_worktree_option_pick_a_project_folder_abov\":\"Вариант с новым рабочим деревом: выберите папку проекта выше — если это репозиторий git, я могу планировать и собирать в отдельном рабочем дереве.\",\"keeps_your_main_checkout_untouched_branch\":\"Ваш основной рабочий каталог остаётся нетронутым: я создам ветку {{branch}} в отдельной папке рядом с репозиторием и буду планировать и собирать там.\",\"let_s_plan_something\":\"Давайте что-нибудь спланируем\",\"never_mind\":\"Отмена\",\"settings\":\"Настройки\",\"start_the_conversation\":\"Начать разговор →\",\"starting\":\"Запуск…\",\"tell_me_what_you_have_in_mind_i_ll_ask_a_few_cla\":\"Расскажите, что вы задумали. Я задам несколько уточняющих вопросов в чате, составлю план, который вы сможете проверить, а затем реализую его, когда вы будете готовы.\",\"this_folder_isn_t_a_git_repository_so_i_ll_work\":\"Эта папка не является репозиторием git, поэтому я буду работать прямо в ней. Выберите репозиторий git, чтобы получить вариант с новым рабочим деревом.\",\"this_spec_will_be_called\":\"Эта спецификация будет называться {{name}}\",\"type_bug_blurb\":\"Разобраться в проблеме, найти первопричину и спланировать исправление.\",\"type_bug_title\":\"Исправить ошибку\",\"type_feature_blurb\":\"Полный план: требования, технический дизайн и список задач.\",\"type_feature_title\":\"Создать что-то новое\",\"type_quick_blurb\":\"Без формальностей — только цель и список задач.\",\"type_quick_title\":\"Быстрый план\",\"what_do_you_want_to_do\":\"Что вы хотите сделать?\",\"what_kind_of_work_is_it\":\"Какого рода эта работа?\",\"which_project_is_this_for\":\"Для какого проекта это?\",\"work_in_a_fresh_worktree\":\"Работать в новом рабочем дереве\",\"your_plan_is_saved_as_plain_markdown_inside_your\":\"Ваш план сохраняется как обычный markdown внутри проекта (.kiro/specs), поэтому он работает и с Kiro IDE и CLI. Изменить место хранения спеков можно в\"},\"projectPicker\":{\"browse\":\"Обзор\",\"change\":\"изменить\",\"choose_a_project_folder\":\"Выберите папку проекта…\",\"choose_a_project_folder_aria\":\"Выбрать папку проекта\",\"go_to_parent_folder\":\"Перейти в родительскую папку\",\"hide_path_input\":\"Скрыть поле пути\",\"home_you_projects_my_app\":\"/home/you/projects/my-app\",\"loading\":\"Загрузка…\",\"no_subfolders_here_use_use_this_folder_above_to\":\"Здесь нет вложенных папок — нажмите «Использовать эту папку» выше, чтобы выбрать текущую.\",\"open_folder\":\"Открыть папку {{name}}\",\"project_folder_change\":\"Папка проекта: {{path}} — изменить\",\"project_folder_path\":\"Путь к папке проекта\",\"recent_projects\":\"Недавние проекты\",\"type_a_path_instead\":\"Ввести путь вручную\",\"up\":\"Вверх\",\"use_recent_project\":\"Использовать недавний проект {{path}}\",\"use_this_folder\":\"Использовать эту папку\",\"use_this_folder_path\":\"Использовать эту папку: {{path}}\",\"load_failed\":\"Не удалось получить список этой папки\",\"load_failed_unknown\":\"Чтение не удалось, причина не указана.\",\"retry\":\"Повторить\"},\"settingsModal\":{\"cancel\":\"Отмена\",\"couldn_t_load_these_settings\":\"Не удалось загрузить эти настройки — сохранение недоступно, пока они не загрузятся.\",\"couldn_t_save_these_settings\":\"Не удалось сохранить эти настройки.\",\"default_keeps_the_model_your_chat_agent_resolves\":\"По умолчанию используется модель, которую уже выбирает ваш чат-агент. Выбор применяется к сессиям спеков, начатым после изменения — спек в работе сохраняет текущую модель.\",\"empty_keep_specs_with_each_project_recommended\":\"Пусто = хранить спеки вместе с каждым проектом (рекомендуется)\",\"leave_this_empty_to_keep_specs_inside_each_proje\":\"Оставьте поле пустым, чтобы хранить спеки внутри каждого проекта (папка .kiro/specs рядом с кодом — стандарт Kiro). Либо укажите путь к папке, чтобы собирать все спеки в одном месте.\",\"model_default_inherit\":\"По умолчанию (наследовать)\",\"save\":\"Сохранить\",\"saving\":\"Сохранение…\",\"settings\":\"Настройки\",\"spec_generation_model\":\"Модель генерации спеков\",\"spec_storage_folder_path\":\"Путь к папке хранения спеков\",\"where_should_specs_be_saved\":\"Где сохранять спеки?\",\"which_model_should_run_spec_generation\":\"Какая модель должна выполнять генерацию спеков?\"},\"shimmer\":{\"loading_specs\":\"Загрузка спеков…\",\"loading_the_conversation\":\"Загрузка беседы…\",\"writing_this_document\":\"Документ пишется…\"},\"specDetail\":{\"advance_to_design\":\"Согласовать → Дизайн\",\"advance_to_tasks\":\"Согласовать → Задачи\",\"an_agent_will_work_through_the_task_list\":\"Агент пройдёт по списку задач\",\"approved\":\"Согласовано\",\"approved_by_user\":\"Согласовал {{user}}\",\"archive_this_spec\":\"Архивировать эту спеку\",\"cancel\":\"Отмена\",\"changed_since_approval\":\"Изменено после согласования\",\"clear\":\"Очистить\",\"close_esc\":\"Закрыть (Esc)\",\"close_review_view\":\"Закрыть режим просмотра\",\"couldn_t_remove_this_spec_try_again\":\"Не удалось убрать эту спецификацию — повторите попытку.\",\"delete_spec_named\":\"Убрать спецификацию {{name}}\",\"delete_this_spec\":\"Убрать эту спецификацию\",\"document_file_name\":\"{{name}}.md\",\"drafting_design\":\"Составление дизайна…\",\"drafting_tasks\":\"Составление задач…\",\"drag_or_use_to_resize\":\"Потяните или используйте ← →, чтобы изменить размер\",\"duplicate_this_spec\":\"Дублировать эту спеку\",\"expand_document_for_review\":\"Развернуть документ для проверки\",\"expand_for_review_esc_to_close\":\"Развернуть для проверки (Esc закрывает)\",\"name_for_the_copy\":\"Название копии\",\"pause\":\"Пауза\",\"pausing\":\"Приостановка…\",\"pending_comment_few\":\"{{count}} неотправленных комментария\",\"pending_comment_many\":\"{{count}} неотправленных комментариев\",\"pending_comment_one\":\"{{count}} неотправленный комментарий\",\"pending_comment_other\":\"{{count}} неотправленных комментария\",\"remove_comment_on\":\"Удалить комментарий к {{document}}\",\"remove_spec_body\":\"«{{name}}» исчезнет из Spec Builder. Файлы markdown останутся в проекте, а любой агент, работающий над этой спецификацией, будет остановлен.\",\"remove_this_spec\":\"Убрать эту спецификацию?\",\"removing\":\"Удаление…\",\"rename_this_spec_label_the_folder_name_stays\":\"Измените подпись этой спеки. Имя папки и ветки останутся теми же.\",\"resize_document_panel\":\"Изменить размер панели документа\",\"restore_this_spec\":\"Восстановить эту спеку\",\"review_document_named\":\"Просмотреть {{document}}.md для {{name}}\",\"send_all_to_agent\":\"Отправить всё агенту\",\"sending\":\"Отправка…\",\"spec_label\":\"Подпись спеки\",\"start_building\":\"Начать сборку\",\"starting\":\"Запуск…\",\"tab_design\":\"Дизайн\",\"tab_requirements\":\"Требования\",\"tab_tasks\":\"Задачи\",\"tells_the_agent_this_phase_is_approved_and_to_mo\":\"Записывает ваше согласование этой версии, а затем говорит агенту двигаться дальше\",\"the_agent_is_writing_the_next_document\":\"Одобрено — агент пишет следующий документ\",\"this_document_changed_after_it_was_approved\":\"Этот документ изменился после согласования\",\"working\":\"работает…\"},\"specRail\":{\"active\":\"В РАБОТЕ\",\"agent_working\":\"агент работает\",\"an_agent_is_working\":\"Агент работает\",\"filter_specs\":\"Фильтровать спеки\",\"filter_specs_by_name\":\"Фильтровать спеки по имени\",\"new_spec\":\"Новая спека\",\"plan_ready\":\"ПЛАН ГОТОВ\",\"settings\":\"Настройки\",\"show_spec_list\":\"Показать список спеков\",\"show_specs\":\"Показать спеки\",\"spec_builder\":\"Spec Builder\",\"spec_builder_settings\":\"Настройки Spec Builder\",\"specs\":\"СПЕКИ\",\"v\":\"v\"},\"specStatePanel\":{\"answer_option\":\"Ответить на «{{title}}» вариантом {{option}}\",\"answer_option_recommended\":\"Ответить на «{{title}}» вариантом {{option}} (рекомендуется)\",\"answered\":\"отвечено\",\"blocking\":\"БЛОКИРУЕТ\",\"context\":\"КОНТЕКСТ\",\"decision_title\":\"Решение — {{title}}\",\"decisions\":\"РЕШЕНИЯ\",\"options_for\":\"Варианты для {{title}}\",\"pending\":\"ожидает\",\"recommended\":\"РЕКОМЕНДУЕТСЯ\",\"sending\":\"отправка…\",\"template\":\"Шаблон\",\"tool_calls\":\"Вызовы инструментов\",\"turns\":\"Циклы\",\"worktree\":\"Рабочее дерево\"},\"taskList\":{\"done\":\"Готово\",\"no_tasks_yet\":\"Задач пока нет. После согласования дизайна здесь появится упорядоченный список задач, и вы сможете запускать их по одной.\",\"pause_the_build_first\":\"Поставьте сборку на паузу, прежде чем запускать отдельную задачу\",\"run\":\"Запустить\",\"run_only_this_task_and_stop\":\"Запустить только эту задачу и остановиться\",\"run_task\":\"Запустить задачу: {{task}}\",\"starting\":\"Запуск…\",\"task_progress\":\"Прогресс по задачам\",\"done_of_total_one\":\"Готово {{done}} из {{total}} задачи\",\"done_of_total_few\":\"Готово {{done}} из {{total}} задач\",\"done_of_total_many\":\"Готово {{done}} из {{total}} задач\",\"done_of_total_other\":\"Готово {{done}} из {{total}} задачи\"},\"workspace\":{\"describe_what_you_want_to_build_answer_a_few_que\":\"Опишите, что вы хотите создать, ответьте на несколько вопросов и получите проверенный план — требования, дизайн и задачи — который сможет выполнить агент.\",\"pick_a_spec_to_continue_where_you_left_off\":\"Выберите спеку, чтобы продолжить с того места, где остановились\",\"plan_your_next_feature_with_a_spec\":\"Спланируйте следующую функцию с помощью спеки\",\"resize_spec_list\":\"Изменить размер списка спеков\",\"start_your_first_spec\":\"Создайте свою первую спеку\"}},\"manifest\":{\"description\":\"Разработка через спецификации внутри Kiro Crew: превращай идею функции в Требования → Дизайн → Задачи с помощью встроенного агента, просматривай markdown прямо в приложении, а затем передавай утверждённый план автономной сессии выполнения.\",\"display_name\":\"Spec Builder\",\"use_case_1\":\"Превращайте функцию, ошибку или небольшую задачу в учитывающие репозиторий требования, дизайн и шаги реализации, доступные для проверки.\",\"configuration_1\":\"Выберите папку проекта и режим Feature, Bug или Quick, при желании создайте свежий worktree, затем проверьте и утвердите каждый созданный этап перед началом сборки.\",\"page_label\":\"Spec Builder\"},\"specBuilderPage\":{\"spec_builder\":\"Spec Builder\",\"talk_through_an_idea_review_the_plan_then_let_an\":\"Обсудите идею, проверьте план, а затем поручите агенту её реализовать.\"}},\"issueRadar\":{\"components\":{\"detailOverflowMenu\":{\"more_actions\":\"Другие действия\"}}},\"meetings\":{\"review\":{\"archivedSection\":\"В архиве\"}}}"),
		components: {
			"ui": {
				"no_noun_match": "Нет совпадающих {{noun}}",
				"no_matches_for": "Нет совпадений для",
				"clear_filter": "Очистить фильтр"
			},
			"resizeHandle": { "drag_to_resize": "Потяните, чтобы изменить размер" }
		}
	},
	"zh-CN": {
		apps: /* @__PURE__ */ JSON.parse("{\"specBuilder\":{\"api\":{\"phase_building\":\"构建中\",\"phase_design\":\"设计\",\"phase_new\":\"刚开始\",\"phase_ready\":\"就绪\",\"phase_requirements\":\"需求\",\"phase_tasks\":\"方案就绪\",\"something_went_wrong\":\"出了点问题（{{status}}）\"},\"components\":{\"chatColumn\":{\"reply_to_the_spec_agent\":\"回复 Spec 代理…\"},\"columnSplitter\":{\"drag_or_use_to_resize\":\"拖动或使用 ← → 调整大小\"},\"docView\":{\"add_comment\":\"添加评论\",\"comment\":\"评论\",\"comment_on_the_selected_passage\":\"对所选段落发表评论\",\"discard_this_comment\":\"放弃此评论\",\"document_file_name\":\"{{name}}.md\",\"empty_design\":\"还没有设计。当你在对话中通过需求后，技术设计就会出现在这里。\",\"empty_requirements\":\"尚未写下任何需求——在对话中描述你想要的内容，代理会起草这份文档。\",\"empty_tasks\":\"还没有任务清单。你通过设计之后，排好顺序的任务清单会出现在这里。\",\"nothing_here_yet\":\"这里还没有内容。\",\"your_feedback_on_the_passage_in\":\"你对 {{document}} 中所选段落的反馈\",\"your_feedback_on_this_passage_enter_adds_it_to_t\":\"你对这段内容的反馈…（按 Enter 加入队列）\"},\"newSpecView\":{\"describe_what_you_want_to_do\":\"描述你想做的事\",\"e_g_add_login_with_google_so_users_don_t_need_pa\":\"例如“添加 Google 登录，这样用户不需要密码”或“导出按钮在处理大文件时崩溃”\",\"fresh_worktree_option_pick_a_project_folder_abov\":\"全新工作树选项：在上方选择一个项目文件夹——如果它是 git 仓库，我可以在专用工作树中规划并构建。\",\"keeps_your_main_checkout_untouched_branch\":\"保持你的主检出不受影响：我会在仓库旁边的独立文件夹中创建分支 {{branch}}，并在那里规划和构建。\",\"let_s_plan_something\":\"来规划一下\",\"never_mind\":\"取消\",\"settings\":\"设置\",\"start_the_conversation\":\"开始对话 →\",\"starting\":\"正在开始…\",\"tell_me_what_you_have_in_mind_i_ll_ask_a_few_cla\":\"告诉我你的想法。我会在聊天中问几个澄清问题，写出一份可供你审阅的方案，等你准备好后再动手构建。\",\"this_folder_isn_t_a_git_repository_so_i_ll_work\":\"该文件夹不是 git 仓库，因此我会直接在其中工作。选择一个 git 仓库即可获得全新工作树的选项。\",\"this_spec_will_be_called\":\"此规格将命名为 {{name}}\",\"type_bug_blurb\":\"排查问题，找出根本原因，并规划修复方案。\",\"type_bug_title\":\"修复 bug\",\"type_feature_blurb\":\"完整方案：需求、技术设计和任务清单。\",\"type_feature_title\":\"构建新东西\",\"type_quick_blurb\":\"跳过正式流程——只要一个目标和一份任务清单。\",\"type_quick_title\":\"快速方案\",\"what_do_you_want_to_do\":\"你想做什么？\",\"what_kind_of_work_is_it\":\"这属于哪类工作？\",\"which_project_is_this_for\":\"这是为哪个项目做的？\",\"work_in_a_fresh_worktree\":\"在全新工作树中工作\",\"your_plan_is_saved_as_plain_markdown_inside_your\":\"你的方案以纯 markdown 形式保存在项目内（.kiro/specs），因此也可配合 Kiro IDE 和 CLI 使用。你可以更改 spec 的存放位置：\"},\"projectPicker\":{\"browse\":\"浏览\",\"change\":\"更改\",\"choose_a_project_folder\":\"选择项目文件夹…\",\"choose_a_project_folder_aria\":\"选择项目文件夹\",\"go_to_parent_folder\":\"转到上级文件夹\",\"hide_path_input\":\"隐藏路径输入框\",\"home_you_projects_my_app\":\"/home/you/projects/my-app\",\"loading\":\"正在加载…\",\"no_subfolders_here_use_use_this_folder_above_to\":\"此处没有子文件夹——请使用上方的“使用此文件夹”来选择当前文件夹。\",\"open_folder\":\"打开文件夹 {{name}}\",\"project_folder_change\":\"项目文件夹：{{path}} — 更改\",\"project_folder_path\":\"项目文件夹路径\",\"recent_projects\":\"最近的项目\",\"type_a_path_instead\":\"改为输入路径\",\"up\":\"向上\",\"use_recent_project\":\"使用最近的项目 {{path}}\",\"use_this_folder\":\"使用此文件夹\",\"use_this_folder_path\":\"使用此文件夹：{{path}}\",\"load_failed\":\"无法列出此文件夹\",\"load_failed_unknown\":\"读取失败，未给出原因。\",\"retry\":\"重试\"},\"settingsModal\":{\"cancel\":\"取消\",\"couldn_t_load_these_settings\":\"无法加载这些设置，加载成功前无法保存。\",\"couldn_t_save_these_settings\":\"无法保存这些设置。\",\"default_keeps_the_model_your_chat_agent_resolves\":\"默认沿用聊天代理当前解析到的模型。所选模型对更改后启动的 spec 会话生效——进行中的 spec 会继续使用其当前模型。\",\"empty_keep_specs_with_each_project_recommended\":\"留空 = 将 spec 保存在各自的项目中（推荐）\",\"leave_this_empty_to_keep_specs_inside_each_proje\":\"留空即可将 spec 保存在每个项目内部（代码旁的 .kiro/specs 文件夹，这是 Kiro 的标准做法）。或者设置一个文件夹路径，把所有 spec 集中存放。\",\"model_default_inherit\":\"默认（继承）\",\"save\":\"保存\",\"saving\":\"正在保存…\",\"settings\":\"设置\",\"spec_generation_model\":\"spec 生成模型\",\"spec_storage_folder_path\":\"spec 存放文件夹路径\",\"where_should_specs_be_saved\":\"spec 应保存在哪里？\",\"which_model_should_run_spec_generation\":\"应由哪个模型运行 spec 生成？\"},\"shimmer\":{\"loading_specs\":\"正在加载 spec…\",\"loading_the_conversation\":\"正在加载对话…\",\"writing_this_document\":\"正在撰写此文档…\"},\"specDetail\":{\"advance_to_design\":\"通过 → 设计\",\"advance_to_tasks\":\"通过 → 任务\",\"an_agent_will_work_through_the_task_list\":\"代理将逐项完成任务清单\",\"approved\":\"已批准\",\"approved_by_user\":\"由 {{user}} 批准\",\"archive_this_spec\":\"归档此 spec\",\"cancel\":\"取消\",\"changed_since_approval\":\"批准后已变更\",\"clear\":\"清空\",\"close_esc\":\"关闭（Esc）\",\"close_review_view\":\"关闭审阅视图\",\"couldn_t_remove_this_spec_try_again\":\"无法移除此规格，请重试。\",\"delete_spec_named\":\"移除规格 {{name}}\",\"delete_this_spec\":\"移除此规格\",\"document_file_name\":\"{{name}}.md\",\"drafting_design\":\"正在撰写设计…\",\"drafting_tasks\":\"正在撰写任务…\",\"drag_or_use_to_resize\":\"拖动或使用 ← → 调整大小\",\"duplicate_this_spec\":\"复制此 spec\",\"expand_document_for_review\":\"展开文档以便审阅\",\"expand_for_review_esc_to_close\":\"展开以便审阅（按 Esc 关闭）\",\"name_for_the_copy\":\"副本的名称\",\"pause\":\"暂停\",\"pausing\":\"正在暂停…\",\"pending_comment_other\":\"{{count}} 条待处理评论\",\"remove_comment_on\":\"移除对 {{document}} 的评论\",\"remove_spec_body\":\"“{{name}}”将离开 Spec Builder。Markdown 文件仍保留在项目中，该规格上正在运行的代理将被停止。\",\"remove_this_spec\":\"移除此规格？\",\"removing\":\"正在移除…\",\"rename_this_spec_label_the_folder_name_stays\":\"重命名此 spec 的标签。它的文件夹名和分支名保持不变。\",\"resize_document_panel\":\"调整文档面板大小\",\"restore_this_spec\":\"恢复此 spec\",\"review_document_named\":\"审阅 {{name}} 的 {{document}}.md\",\"send_all_to_agent\":\"全部发送给代理\",\"sending\":\"正在发送…\",\"spec_label\":\"Spec 标签\",\"start_building\":\"开始构建\",\"starting\":\"正在启动…\",\"tab_design\":\"设计\",\"tab_requirements\":\"需求\",\"tab_tasks\":\"任务\",\"tells_the_agent_this_phase_is_approved_and_to_mo\":\"记录你对此版本的批准，然后让代理继续下一步\",\"the_agent_is_writing_the_next_document\":\"已批准 — 代理正在撰写下一个文档\",\"this_document_changed_after_it_was_approved\":\"此文档在批准之后发生了变更\",\"working\":\"正在处理…\"},\"specRail\":{\"active\":\"进行中\",\"agent_working\":\"代理工作中\",\"an_agent_is_working\":\"有代理正在工作\",\"filter_specs\":\"筛选 spec\",\"filter_specs_by_name\":\"按名称筛选 spec\",\"new_spec\":\"新建 spec\",\"plan_ready\":\"方案就绪\",\"settings\":\"设置\",\"show_spec_list\":\"显示 spec 列表\",\"show_specs\":\"显示 spec\",\"spec_builder\":\"Spec Builder\",\"spec_builder_settings\":\"Spec Builder 设置\",\"specs\":\"SPEC\",\"v\":\"v\"},\"specStatePanel\":{\"answer_option\":\"用“{{option}}”回答“{{title}}”\",\"answer_option_recommended\":\"用“{{option}}”回答“{{title}}”（推荐）\",\"answered\":\"已回答\",\"blocking\":\"阻塞项\",\"context\":\"上下文\",\"decision_title\":\"决定 — {{title}}\",\"decisions\":\"决策\",\"options_for\":\"{{title}} 的选项\",\"pending\":\"待处理\",\"recommended\":\"推荐\",\"sending\":\"正在发送…\",\"template\":\"模板\",\"tool_calls\":\"工具调用\",\"turns\":\"轮次\",\"worktree\":\"工作树\"},\"taskList\":{\"done\":\"已完成\",\"no_tasks_yet\":\"还没有任务。设计通过之后，排好顺序的任务清单会出现在这里，你可以逐个运行任务。\",\"pause_the_build_first\":\"运行单个任务前请先暂停构建\",\"run\":\"运行\",\"run_only_this_task_and_stop\":\"只运行此任务，然后停止\",\"run_task\":\"运行任务：{{task}}\",\"starting\":\"正在启动…\",\"task_progress\":\"任务进度\",\"done_of_total_other\":\"已完成 {{done}} / {{total}} 个任务\"},\"workspace\":{\"describe_what_you_want_to_build_answer_a_few_que\":\"描述你想构建的内容，回答几个问题，然后获得一份经过审阅的方案——需求、设计和任务——供代理执行。\",\"pick_a_spec_to_continue_where_you_left_off\":\"选择一个 spec，从上次中断处继续\",\"plan_your_next_feature_with_a_spec\":\"用 spec 规划你的下一个功能\",\"resize_spec_list\":\"调整 spec 列表大小\",\"start_your_first_spec\":\"创建你的第一个 spec\"}},\"manifest\":{\"use_case_1\":\"将功能、缺陷或快速任务转换为结合仓库上下文且可审阅的需求、设计和实施步骤。\",\"configuration_1\":\"选择项目文件夹和 Feature、Bug 或 Quick 模式，可选创建新工作树，然后在开始构建前审阅并批准每个生成阶段。\",\"description\":\"在 Kiro Crew 内进行 spec 驱动开发：借助内嵌代理把一个功能想法变成需求 → 设计 → 任务，在应用内审阅 markdown，然后把已通过的方案交给一个自主执行会话去完成。\",\"display_name\":\"Spec Builder\",\"page_label\":\"Spec Builder\"},\"specBuilderPage\":{\"spec_builder\":\"Spec Builder\",\"talk_through_an_idea_review_the_plan_then_let_an\":\"聊清一个想法，审阅方案，然后让代理去实现。\"}},\"issueRadar\":{\"components\":{\"detailOverflowMenu\":{\"more_actions\":\"更多操作\"}}},\"meetings\":{\"review\":{\"archivedSection\":\"已归档\"}}}"),
		components: {
			"ui": {
				"no_noun_match": "没有匹配的{{noun}}",
				"no_matches_for": "没有匹配",
				"clear_filter": "清除筛选"
			},
			"resizeHandle": { "drag_to_resize": "拖动以调整大小" }
		}
	}
};
var own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
function lookup(catalog, key) {
	let node = catalog;
	for (const part of key.split(".")) {
		if (node === void 0 || typeof node === "string" || !own(node, part)) return void 0;
		node = node[part];
	}
	return typeof node === "string" ? node : void 0;
}
/** The catalogs to try for `locale`, most specific first, always ending in English. */
function localeChain(locale) {
	const chain = [];
	const add = (candidate) => {
		if (own(CATALOGS, candidate) && !chain.includes(candidate)) chain.push(candidate);
	};
	add(locale);
	add(locale.split("-")[0]);
	add("en");
	return chain;
}
function currentLocale() {
	try {
		const locale = activeLocale();
		return typeof locale === "string" && locale ? locale : "en";
	} catch {
		return "en";
	}
}
var PLACEHOLDER = /\{\{\s*(\w+)\s*\}\}/g;
function pluralForm(locale, count) {
	try {
		return new Intl.PluralRules(locale).select(count);
	} catch {
		return count === 1 ? "one" : "other";
	}
}
function t(key, vars) {
	const count = vars && typeof vars.count === "number" ? vars.count : void 0;
	for (const locale of localeChain(currentLocale())) {
		const catalog = CATALOGS[locale];
		let text;
		if (count !== void 0) text = lookup(catalog, `${key}_${pluralForm(locale, count)}`) ?? lookup(catalog, `${key}_other`);
		text = text ?? lookup(catalog, key);
		if (text !== void 0) return text.replace(PLACEHOLDER, (whole, name) => vars && own(vars, name) ? String(vars[name]) : whole);
	}
	return key;
}
/** The dashboard's name for this helper, so the ported call sites read unchanged. */
var i18nT = t;
// src/api.ts
var API = "/api/apps/spec-builder";
/** Shown in the rail footer: app.json's version. */
var APP_VERSION = "0.1.0";
/** Drop empty fields so an absent value never reads as a claim of "". */
function identity(id) {
	const out = {};
	if (id?.spec_dir) out.spec_dir = id.spec_dir;
	if (id?.slot_key) out.slot_key = id.slot_key;
	return out;
}
/** Before the root mounts (tests, or a module evaluated early): a plain fetch
*  that fails the way the scoped client does, with `status` and the raw `body`. */
var sameOriginFetch = { async raw(path, init) {
	const r = await fetch(path, {
		credentials: "same-origin",
		...init
	});
	if (!r.ok) {
		let text = "";
		try {
			text = typeof r.text === "function" ? await r.text() : JSON.stringify(await r.json());
		} catch {}
		throw Object.assign(/* @__PURE__ */ new Error(`API ${r.status}`), {
			status: r.status,
			body: text
		});
	}
	return r;
} };
var transport = sameOriginFetch;
/** Route every call through *next* (the page root passes `useAppApi()`). */
function setTransport(next) {
	transport = next ?? sameOriginFetch;
}
/** An error carrying the backend's required machine-readable `code`. */
var SpecApiError = class extends Error {
	code;
	constructor(message, code) {
		super(message);
		this.name = "SpecApiError";
		this.code = code;
	}
};
/** The scoped client's refusal, read back into the backend's sentence and code. */
function refusal(err) {
	if (!err || typeof err !== "object" || typeof err.status !== "number") return err;
	const status = err.status;
	const body = err.body;
	let msg = i18nT("apps.specBuilder.api.something_went_wrong", { status });
	let code = "";
	try {
		const parsed = JSON.parse(typeof body === "string" ? body : "");
		msg = parsed.error || msg;
		code = parsed.code || "";
	} catch {}
	return new SpecApiError(msg, code);
}
async function req(path, opts) {
	let r;
	try {
		r = await transport.raw(API + path, {
			credentials: "same-origin",
			headers: { "Content-Type": "application/json" },
			...opts
		});
	} catch (err) {
		throw refusal(err);
	}
	if (r.status === 204) return void 0;
	if (typeof r.text !== "function") return await r.json();
	const text = await r.text();
	return text.trim() === "" ? void 0 : JSON.parse(text);
}
var enc = (name) => encodeURIComponent(name);
var specApi = {
	list: (signal) => req("/specs", { signal }),
	create: (body) => req("/specs", {
		method: "POST",
		body: JSON.stringify(body)
	}),
	get: async (name, signal) => {
		const detail = await req("/specs/" + enc(name), { signal });
		if (detail.decision_recovery_pending && detail.spec_dir && detail.slot_key) {
			if ((await req("/specs/" + enc(name) + "/recover-decision", {
				method: "POST",
				body: JSON.stringify(identity(detail))
			})).ok) detail.running = true;
		}
		return detail;
	},
	message: (name, text, id) => req("/specs/" + enc(name) + "/message", {
		method: "POST",
		body: JSON.stringify({
			text,
			...identity(id)
		})
	}),
	answerDecision: (name, decisionId, option, text, id) => req("/specs/" + enc(name) + "/message", {
		method: "POST",
		body: JSON.stringify({
			text,
			decision_id: decisionId,
			decision_option: option,
			...identity(id)
		})
	}),
	execute: (name, id) => req("/specs/" + enc(name) + "/execute", {
		method: "POST",
		body: JSON.stringify(identity(id))
	}),
	stop: (name, id) => req("/specs/" + enc(name) + "/stop", {
		method: "POST",
		body: JSON.stringify(identity(id))
	}),
	remove: (name, id) => {
		const q = new URLSearchParams(identity(id)).toString();
		return req("/specs/" + enc(name) + (q ? "?" + q : ""), { method: "DELETE" });
	},
	/** Record an approval of `phase` against the exact document hash reviewed. The
	*  server rejects a hash that is not the current one, so an approval always
	*  names a version somebody actually saw. */
	approve: (name, phase, hash, id) => req("/specs/" + enc(name) + "/approve", {
		method: "POST",
		body: JSON.stringify({
			phase,
			hash,
			...identity(id)
		})
	}),
	/** Run ONE task as a single turn. Both index and hash are sent: the agent
	*  rewrites tasks.md between polls, so an index alone could dispatch whatever
	*  ended up in that position. */
	runTask: (name, index, hash, id) => req("/specs/" + enc(name) + "/task", {
		method: "POST",
		body: JSON.stringify({
			index,
			hash,
			...identity(id)
		})
	}),
	/** Set the display label. '' clears it and the UI falls back to the name. */
	setTitle: (name, title, id) => req("/specs/" + enc(name) + "/title", {
		method: "POST",
		body: JSON.stringify({
			title,
			...identity(id)
		})
	}),
	/** Move a spec out of the working set, or bring it back. Non-destructive. */
	setArchived: (name, archived, id) => req("/specs/" + enc(name) + "/archive", {
		method: "POST",
		body: JSON.stringify({
			archived,
			...identity(id)
		})
	}),
	/** Copy the documents into a new spec. The copy gets a fresh conversation. */
	duplicate: (name, new_name, id) => req("/specs/" + enc(name) + "/duplicate", {
		method: "POST",
		body: JSON.stringify({
			new_name,
			...identity(id)
		})
	}),
	getSettings: (signal) => req("/settings", { signal }),
	saveSettings: (base_path, model) => req("/settings", {
		method: "POST",
		body: JSON.stringify({
			base_path,
			model
		})
	}),
	/** The host's model list for this caller (the app's GET /models). */
	models: (signal) => req("/models", { signal }),
	browse: (path, signal) => {
		const q = new URLSearchParams({ path: path || "" }).toString();
		return req("/browse" + (q ? "?" + q : ""), { signal });
	}
};
/** localStorage keys (renamed from the external app's kiro-specs:* namespace). */
var LS = {
	lastOpen: "spec-builder:last-open",
	/** Legacy: '0' meant COLLAPSED. Read once for migration, never written. */
	railOpen: "spec-builder:rail-open",
	/** Current: '1' means collapsed (the shared hook's encoding). */
	railCollapsed: "spec-builder:rail-collapsed",
	railWidth: "spec-builder:rail-width",
	docPct: "spec-builder:doc-pct"
};
/** Persisted rail width, clamped — a corrupt value must not wedge the layout. */
function loadRailWidth() {
	try {
		const v = Number(localStorage.getItem(LS.railWidth));
		if (Number.isFinite(v) && v >= 190 && v <= 420) return v;
	} catch {}
	return 250;
}
/** Persisted collapsed flag.
*
*  The shared hook writes '1' for collapsed; the app's previous key wrote '0'
*  for collapsed under the opposite name (rail-OPEN). Reusing that key would
*  invert the state for anyone who had already collapsed the rail, so the flag
*  moved to its own key and the old one is read once as a fallback.
*/
function loadRailCollapsed() {
	try {
		const current = localStorage.getItem(LS.railCollapsed);
		if (current !== null) return current === "1";
		return localStorage.getItem(LS.railOpen) === "0";
	} catch {
		return false;
	}
}
/** Slugify a free-text description into a stable spec name.
*
*  The ASCII filter below means a description written entirely in a non-Latin
*  script (Korean, Japanese, Cyrillic, emoji, …) filters down to the empty
*  string. The name becomes the spec's on-disk directory and its
*  ``spec/<name>`` worktree branch, so rather than emitting raw Unicode into a
*  filesystem path and a git ref, such input falls back to a generic ASCII
*  stem plus a short hash of the original text. The hash is a pure function of
*  the input: the branch-name preview and the created spec agree across
*  re-renders, and the same description always derives the same name (a rare
*  collision is absorbed by the caller's numeric-suffix retry). Latin input is
*  unchanged byte-for-byte.
*/
function slugify(text) {
	const raw = text || "";
	const ascii = raw.toLowerCase().replace(/[^a-z0-9\s_-]/g, "").trim().split(/\s+/).slice(0, 5).join("-").replace(/-+/g, "-").replace(/^[-_]+/, "").slice(0, 48);
	if (ascii) return ascii;
	let h = 2166136261;
	for (let i = 0; i < raw.length; i++) {
		h ^= raw.charCodeAt(i);
		h = Math.imul(h, 16777619) >>> 0;
	}
	return "spec-" + h.toString(16).padStart(8, "0");
}
/**
* Catalog key per phase. A literal Record of keys is the only shape
* ``scripts/check-i18n-keys.mjs`` can resolve statically, so the table holds
* keys and ``phaseLabel`` translates at the point of use.
*/
var PHASE_LABEL_KEY = {
	new: "apps.specBuilder.api.phase_new",
	requirements: "apps.specBuilder.api.phase_requirements",
	design: "apps.specBuilder.api.phase_design",
	tasks: "apps.specBuilder.api.phase_tasks"
};
/** Status overrides that are not phases: shown while the agent runs, and for a
*  finished plan in the rail. */
var PHASE_BUILDING_KEY = "apps.specBuilder.api.phase_building";
var PHASE_READY_KEY = "apps.specBuilder.api.phase_ready";
/**
* Localised label for a spec phase, or the phase id VERBATIM when the backend
* reports one this table does not know — better than fabricating copy.
*
* ``hasOwnProperty``, not ``in``: the phase comes off a backend payload, so a
* value like ``toString`` would otherwise resolve to an inherited
* Object.prototype member and hand a function to i18next.
*/
function phaseLabel(phase) {
	return Object.prototype.hasOwnProperty.call(PHASE_LABEL_KEY, phase) ? i18nT(PHASE_LABEL_KEY[phase]) : phase;
}
/** Fast poll while a turn is in flight, the Tasks tab is open, or tasks.md just changed. */
var SPEC_DETAIL_FAST_POLL_MS = 2500;
/** Catch the worker slot coming up after a dispatch (running is still false). */
var SPEC_DETAIL_DISPATCH_POLL_MS = 1200;
/** Idle poll when nothing is writing and the user is not watching Tasks. */
var SPEC_DETAIL_IDLE_POLL_MS = 6e3;
/** Interval for the spec-detail React Query poll.
*
*  Fast while the worker is active, for a follow-up window after THIS view
*  dispatched an instruction, while the user is looking at the Tasks panel,
*  and for the same follow-up window after tasks.md's content hash changes
*  (an agent or a hand edit that never hit lastSendAt). Otherwise idle.
*/
function specDetailPollMs(input) {
	if (input.running || input.status === "executing") return SPEC_DETAIL_FAST_POLL_MS;
	if ((input.msSinceDispatch ?? Number.POSITIVE_INFINITY) < 2e4) return SPEC_DETAIL_DISPATCH_POLL_MS;
	if (input.watchingTasks) return SPEC_DETAIL_FAST_POLL_MS;
	if ((input.msSinceTasksChange ?? Number.POSITIVE_INFINITY) < 2e4) return SPEC_DETAIL_FAST_POLL_MS;
	return SPEC_DETAIL_IDLE_POLL_MS;
}
// src/host/safeStorage.ts
/** Best-effort `localStorage` write: a full quota or private mode is swallowed.
*
*  The dashboard's `safeSetItem` also reclaims its own disposable caches under
*  quota pressure; those caches are the host's, not this page's, so the page only
*  makes the write non-fatal. */
function safeSetItem(key, value) {
	try {
		localStorage.setItem(key, value);
	} catch {}
}
// src/host/useIsMobile.ts
var MOBILE_QUERY = `(max-width: 767px)`;
function mql() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia(MOBILE_QUERY) : null;
}
function subscribe(cb) {
	const list = mql();
	list?.addEventListener("change", cb);
	window.addEventListener("resize", cb);
	return () => {
		list?.removeEventListener("change", cb);
		window.removeEventListener("resize", cb);
	};
}
var snapshot = () => mql()?.matches ?? false;
/** Whether the viewport is below the dashboard's narrow-layout breakpoint.
*
*  The dashboard's hook also wraps a form switch in a view transition and
*  reports "not narrow" inside its IDE embed; both are host chrome, so this
*  copy reads the media query alone. */
function useIsMobile() {
	return useSyncExternalStore(subscribe, snapshot, () => false);
}
// src/host/usePointerDrag.ts
/**
* Attach the returned handlers to a drag handle:
*   const drag = usePointerDrag({ onMove: ({ dx }) => setWidth(w0 - dx), threshold: 10 })
*   <div {...drag} />
*/
function usePointerDrag(opts) {
	const st = useRef({
		startX: 0,
		startY: 0,
		lastX: 0,
		lastY: 0,
		active: false,
		committed: false
	});
	const optsRef = useRef(opts);
	optsRef.current = opts;
	const fallback = useRef(null);
	const disarmFallback = useCallback(() => {
		fallback.current?.dispose();
		fallback.current = null;
	}, []);
	const endRef = useRef(() => {});
	const onPointerDown = useCallback((e) => {
		if (e.pointerType === "mouse" && e.button !== 0) return;
		const el = e.currentTarget;
		disarmFallback();
		let captured = true;
		try {
			el.setPointerCapture(e.pointerId);
		} catch {
			captured = false;
		}
		const s = st.current;
		s.startX = e.clientX;
		s.startY = e.clientY;
		s.lastX = e.clientX;
		s.lastY = e.clientY;
		s.active = true;
		s.committed = (optsRef.current.threshold ?? 10) <= 0;
		if (!captured) {
			const pointerId = e.pointerId;
			const onWindowEnd = (ev) => {
				if (ev.pointerId !== pointerId) return;
				endRef.current(ev);
			};
			window.addEventListener("pointerup", onWindowEnd);
			window.addEventListener("pointercancel", onWindowEnd);
			fallback.current = {
				pointerId,
				dispose: () => {
					window.removeEventListener("pointerup", onWindowEnd);
					window.removeEventListener("pointercancel", onWindowEnd);
				}
			};
		}
		optsRef.current.onStart?.(e);
		if (s.committed) optsRef.current.onMove({
			dx: 0,
			dy: 0,
			x: e.clientX,
			y: e.clientY,
			first: true
		});
		e.preventDefault();
	}, [disarmFallback]);
	const onPointerMove = useCallback((e) => {
		const s = st.current;
		if (!s.active) return;
		s.lastX = e.clientX;
		s.lastY = e.clientY;
		const dx = e.clientX - s.startX;
		const dy = e.clientY - s.startY;
		const threshold = optsRef.current.threshold ?? 10;
		if (!s.committed) {
			if (Math.hypot(dx, dy) < threshold) return;
			s.committed = true;
		}
		optsRef.current.onMove({
			dx,
			dy,
			x: e.clientX,
			y: e.clientY,
			first: false
		});
	}, []);
	const end = useCallback((e) => {
		const s = st.current;
		if (!s.active) return;
		s.active = false;
		disarmFallback();
		const target = "currentTarget" in e ? e.currentTarget : null;
		try {
			target?.releasePointerCapture(e.pointerId);
		} catch {}
		if (e.type === "pointerup") {
			s.lastX = e.clientX;
			s.lastY = e.clientY;
		}
		optsRef.current.onEnd?.({
			dx: s.lastX - s.startX,
			dy: s.lastY - s.startY,
			x: s.lastX,
			y: s.lastY,
			first: false,
			committed: s.committed
		});
		s.committed = false;
	}, [disarmFallback]);
	endRef.current = end;
	useEffect(() => disarmFallback, [disarmFallback]);
	return {
		onPointerDown,
		onPointerMove,
		onPointerUp: end,
		onPointerCancel: end,
		onLostPointerCapture: end
	};
}
// src/host/useColumnResize.ts
var DEFAULT_SLOP = 48;
function useColumnResize(storageKey, load, min, max, collapse, loadCollapsed, edge = "right") {
	const sign = edge === "left" ? -1 : 1;
	const [openWidth, setOpenWidth] = useState(load);
	const [collapsed, setCollapsed] = useState(() => !!collapse && !!loadCollapsed?.());
	const [dragging, setDragging] = useState(false);
	const isMobile = useIsMobile();
	const [openedWhileNarrow, setOpenedWhileNarrow] = useState(false);
	const narrowMode = isMobile && !!collapse?.whenNarrow;
	const collapsedEffective = !!collapse && (narrowMode ? !openedWhileNarrow : collapsed);
	const width = collapse && collapsedEffective ? collapse.width : openWidth;
	useEffect(() => {
		if (!narrowMode) setOpenedWhileNarrow(false);
	}, [narrowMode]);
	const startWRef = useRef(0);
	const startCollapsedRef = useRef(false);
	const startOpenRef = useRef(0);
	const draggingRef = useRef(false);
	const liveRef = useRef({
		width,
		collapsed: collapsedEffective,
		openWidth
	});
	liveRef.current = {
		width,
		collapsed: collapsedEffective,
		openWidth
	};
	/** Where the column lands for a drag delta of `dx`, as the OPEN width plus the
	*  collapsed flag. Pure in (dx, drag start), so onMove and onEnd can never
	*  disagree about the result. */
	const resolve = useCallback((dx) => {
		const raw = startWRef.current + dx;
		const clamp = (v) => Math.min(max, Math.max(min, v));
		if (!collapse) return {
			openWidth: clamp(raw),
			collapsed: false
		};
		const slop = collapse.slop ?? DEFAULT_SLOP;
		if (startCollapsedRef.current) {
			const overshoot = raw - (collapse.width + slop);
			return overshoot < 0 ? {
				openWidth: startOpenRef.current,
				collapsed: true
			} : {
				openWidth: clamp(startOpenRef.current + overshoot),
				collapsed: false
			};
		}
		return raw <= min - slop ? {
			openWidth: startOpenRef.current,
			collapsed: true
		} : {
			openWidth: clamp(raw),
			collapsed: false
		};
	}, [
		min,
		max,
		collapse
	]);
	const apply = useCallback((dx) => {
		const next = resolve(dx);
		setOpenWidth(next.openWidth);
		if (narrowMode) setOpenedWhileNarrow(!next.collapsed);
		else setCollapsed(next.collapsed);
		return next;
	}, [resolve, narrowMode]);
	const persist = useCallback((next) => {
		safeSetItem(storageKey, String(next.openWidth));
		if (collapse && !narrowMode) safeSetItem(collapse.storageKey, next.collapsed ? "1" : "0");
	}, [
		storageKey,
		collapse,
		narrowMode
	]);
	const handleProps = usePointerDrag({
		threshold: 0,
		onStart: () => {
			startWRef.current = liveRef.current.width;
			startCollapsedRef.current = liveRef.current.collapsed;
			startOpenRef.current = liveRef.current.openWidth;
			draggingRef.current = true;
			setDragging(true);
			document.body.style.cursor = "col-resize";
			document.body.style.userSelect = "none";
		},
		onMove: ({ dx }) => {
			apply(sign * dx);
		},
		onEnd: ({ dx }) => {
			draggingRef.current = false;
			setDragging(false);
			persist(apply(sign * dx));
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		}
	});
	useEffect(() => () => {
		if (draggingRef.current) {
			draggingRef.current = false;
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		}
	}, []);
	const expand = useCallback(() => {
		if (narrowMode) setOpenedWhileNarrow(true);
		else setCollapsed(false);
		persist({
			openWidth: liveRef.current.openWidth,
			collapsed: false
		});
	}, [persist, narrowMode]);
	/** Collapse to the icon strip, keeping the remembered open width.
	*
	*  Symmetric with `expand`, for consumers that need to collapse for a reason
	*  other than a drag — a narrow viewport, where a fixed-width rail beside a
	*  detail pane would leave the pane too narrow to use. Named apart from the
	*  `collapse` CONFIG parameter above, which it reads.  */
	const collapseColumn = useCallback(() => {
		if (!collapse) return;
		if (narrowMode) setOpenedWhileNarrow(false);
		else setCollapsed(true);
		persist({
			openWidth: liveRef.current.openWidth,
			collapsed: true
		});
	}, [
		persist,
		collapse,
		narrowMode
	]);
	return {
		width,
		collapsed: collapsedEffective,
		dragging,
		expand,
		nudge: useCallback((dx) => {
			const d = sign * dx;
			const live = liveRef.current;
			const clamp = (v) => Math.min(max, Math.max(min, v));
			if (collapse && live.collapsed) {
				if (d <= 0) return;
				const next = {
					openWidth: clamp(live.openWidth),
					collapsed: false
				};
				if (narrowMode) setOpenedWhileNarrow(true);
				else setCollapsed(false);
				setOpenWidth(next.openWidth);
				persist(next);
				return;
			}
			const raw = live.openWidth + d;
			const next = collapse && raw < min ? {
				openWidth: live.openWidth,
				collapsed: true
			} : {
				openWidth: clamp(raw),
				collapsed: false
			};
			if (narrowMode) setOpenedWhileNarrow(!next.collapsed);
			else setCollapsed(next.collapsed);
			setOpenWidth(next.openWidth);
			persist(next);
		}, [
			min,
			max,
			collapse,
			persist,
			narrowMode,
			sign
		]),
		collapse: collapseColumn,
		handleProps
	};
}
// src/host/cn.ts
/** The class names that are set, joined with a space.
*
*  The dashboard's `cn` also runs tailwind-merge to resolve two conflicting
*  utilities; no caller in this page passes a conflicting pair, so a plain join
*  renders the same and the bundle carries no third-party code. */
function cn(...parts) {
	return parts.filter(Boolean).join(" ");
}
// src/inlineStyles.ts
/** Keeps images and code blocks inside the document column. */
var DOC_CSS = ".sb-doc img, .sb-doc svg { max-width: 100%; height: auto } .sb-doc pre { overflow-x: auto }";
/** Row and field hover tints, mixed from the current accent so themes carry through. */
var PICKER_CSS = ".sb-row:hover{background:color-mix(in srgb, var(--accent) 14%, transparent)} .sb-field:hover{border-color:var(--accent)}";
/** Theme accent, and the selection / active tints mixed from it. Translucent so
*  they read correctly on light AND dark backgrounds. CSS values, not copy --
*  they live here so the i18n lint does not read a stylesheet as user text. */
var ACCENT = "var(--accent)";
var SEL_BG = "color-mix(in srgb, var(--accent) 14%, transparent)";
var SEL_BORDER = "color-mix(in srgb, var(--accent) 45%, transparent)";
// src/components/shared.tsx
var inputStyle = {
	width: "100%",
	boxSizing: "border-box",
	padding: "12px 14px",
	borderRadius: "8px",
	border: "1px solid var(--border)",
	fontSize: "14px",
	background: "var(--bg)",
	color: "var(--text)",
	fontFamily: "inherit",
	outline: "none"
};
/** Pill-shaped button — the host `Btn` with a rounded-full skin.
*  Delegates to the shared component so theme tokens, focus ring, disabled
*  state and active-press feedback stay identical to the rest of the
*  dashboard; only the pill radius is app-specific. */
function Btn$1({ label, onClick, primary, danger, disabled, title, big, ariaLabel, nowrap }) {
	return /* @__PURE__ */ jsx(Btn, {
		onClick,
		disabled,
		title,
		primary,
		danger,
		"aria-label": ariaLabel,
		className: cn("rounded-full", big && "px-6 py-2 text-sm", nowrap && "whitespace-nowrap shrink-0"),
		children: label
	});
}
// src/host/Pulse.tsx
/** The opacity keyframes of the dashboard's running-dot pulse (`PULSE_MOTION`). */
var KEYFRAMES = [
	{ opacity: .25 },
	{ opacity: 1 },
	{ opacity: .25 }
];
var TIMING = {
	duration: 1200,
	iterations: Infinity,
	easing: "ease-in-out"
};
function reducedMotion() {
	try {
		return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	} catch {
		return false;
	}
}
/** A `<span>` whose opacity pulses while it is mounted: the running dots.
*
*  The built-in drove this with framer-motion, which the dashboard does not
*  share with app bundles; the same keyframe loop runs through
*  `Element.animate`. With reduced motion asked for, the dot stays still. */
function PulseSpan({ style, ...rest }) {
	const ref = useRef(null);
	useEffect(() => {
		const el = ref.current;
		if (!el || typeof el.animate !== "function" || reducedMotion()) return;
		const animation = el.animate(KEYFRAMES, TIMING);
		return () => animation.cancel();
	}, []);
	return /* @__PURE__ */ jsx("span", {
		ref,
		style,
		"data-pulse": "",
		...rest
	});
}
// src/host/FilteredEmpty.tsx
/** The dashboard's "no matches for …" row with its clear link (`components/ui`
*  `FilteredEmpty`), which the App Kit does not export. */
function FilteredEmpty({ query, onClear, noun, testId = "filtered-empty" }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col items-center justify-center py-8 gap-1.5 animate-rise",
		"data-testid": testId,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "text-muted text-sm",
			children: [
				noun ? i18nT("components.ui.no_noun_match", { noun }) : i18nT("components.ui.no_matches_for"),
				" ",
				/* @__PURE__ */ jsxs("span", {
					className: "font-medium text-text",
					children: [
						"“",
						query,
						"”"
					]
				})
			]
		}), /* @__PURE__ */ jsx("button", {
			onClick: onClear,
			className: "text-accent text-[13px] hover:underline cursor-pointer bg-transparent border-none p-0",
			"data-testid": `${testId}-clear`,
			children: i18nT("components.ui.clear_filter")
		})]
	});
}
// src/components/Shimmer.tsx
/** A single skeleton bar: a soft muted base with a faint accent sweep drifting
*  across it. `delay` offsets each bar so a group flows as a gentle wave. */
function ShimmerLine({ w, h = "12px", delay = 0 }) {
	return /* @__PURE__ */ jsx("div", {
		className: "relative rounded overflow-hidden",
		style: {
			width: w,
			height: h,
			backgroundColor: "color-mix(in srgb, var(--muted) 18%, transparent)"
		},
		children: /* @__PURE__ */ jsx("div", {
			className: "absolute inset-0 animate-shimmer",
			style: {
				backgroundImage: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 18%, transparent), color-mix(in srgb, var(--aim) 18%, transparent), transparent)",
				backgroundSize: "200% 100%",
				animationDelay: `${delay}s`
			}
		})
	});
}
/** Widths cycled so a stack reads as text of varying length, not a uniform grid. */
var ROW_WIDTHS = [
	"78%",
	"54%",
	"86%",
	"62%",
	"70%"
];
/** Placeholder rows for the specs rail while the first list load is in flight.
*  Mirrors a real row: status dot + name + phase label. */
function SpecListSkeleton({ count = 4 }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
		className: "sr-only",
		role: "status",
		children: i18nT("apps.specBuilder.components.shimmer.loading_specs")
	}), /* @__PURE__ */ jsx("div", {
		"aria-hidden": "true",
		className: "flex flex-col gap-0.5",
		children: Array.from({ length: count }, (_, i) => /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-2 px-2.5 py-2 rounded-lg",
			children: [/* @__PURE__ */ jsx(ShimmerLine, {
				w: "7px",
				h: "7px",
				delay: i * .06
			}), /* @__PURE__ */ jsx(ShimmerLine, {
				w: ROW_WIDTHS[i % ROW_WIDTHS.length],
				delay: i * .06 + .04
			})]
		}, i))
	})] });
}
/** Placeholder prose for the document pane while the agent is writing the file.
*  Shaped like a spec document (heading, paragraph, a short list) so the panel
*  holds its rhythm instead of collapsing to a centred spinner. */
function DocSkeleton() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
		className: "sr-only",
		role: "status",
		children: i18nT("apps.specBuilder.components.shimmer.writing_this_document")
	}), /* @__PURE__ */ jsxs("div", {
		"aria-hidden": "true",
		className: "flex flex-col gap-3 px-5 py-[18px]",
		children: [
			/* @__PURE__ */ jsx(ShimmerLine, {
				w: "42%",
				h: "18px"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-2 mt-1",
				children: [
					/* @__PURE__ */ jsx(ShimmerLine, {
						w: "94%",
						delay: .06
					}),
					/* @__PURE__ */ jsx(ShimmerLine, {
						w: "88%",
						delay: .1
					}),
					/* @__PURE__ */ jsx(ShimmerLine, {
						w: "66%",
						delay: .14
					})
				]
			}),
			/* @__PURE__ */ jsx(ShimmerLine, {
				w: "32%",
				h: "15px",
				delay: .2
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex flex-col gap-2",
				children: [
					"80%",
					"72%",
					"86%"
				].map((w, i) => /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(ShimmerLine, {
						w: "6px",
						h: "6px",
						delay: .24 + i * .04
					}), /* @__PURE__ */ jsx(ShimmerLine, {
						w,
						delay: .26 + i * .04
					})]
				}, w))
			})
		]
	})] });
}
/** Placeholder for the conversation column while the spec's detail loads.
*  The chat is deliberately withheld until then: the embedded chat talks to
*  /api/chat, and for a spec discovered on disk the worker slot does not exist
*  yet — whichever endpoint creates it decides whether it is scoped to this app
*  and to the project directory. Bubble-shaped rows so the column holds its
*  layout instead of snapping in. */
function ChatColumnSkeleton() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
		className: "sr-only",
		role: "status",
		children: i18nT("apps.specBuilder.components.shimmer.loading_the_conversation")
	}), /* @__PURE__ */ jsx("div", {
		"aria-hidden": "true",
		className: "flex-1 flex flex-col gap-4 px-5 py-[18px]",
		children: [
			{
				w: "58%",
				self: false
			},
			{
				w: "76%",
				self: true
			},
			{
				w: "64%",
				self: false
			}
		].map((row, i) => /* @__PURE__ */ jsx("div", {
			className: `flex ${row.self ? "justify-end" : "justify-start"}`,
			children: /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-2",
				style: { width: row.w },
				children: [/* @__PURE__ */ jsx(ShimmerLine, {
					w: "100%",
					delay: i * .08
				}), /* @__PURE__ */ jsx(ShimmerLine, {
					w: "72%",
					delay: i * .08 + .04
				})]
			})
		}, row.w))
	})] });
}
// src/components/SpecRail.tsx
function SpecRail({ specs, sel, setSel, onNew, loading = false, onSettings, width, collapsed = false, onExpand, horizontal = false }) {
	const [filter, setFilter] = useState("");
	if (collapsed) {
		const anyRunning = specs.some((s) => s.running);
		if (horizontal) return /* @__PURE__ */ jsxs("aside", {
			className: "w-full shrink-0 flex items-center gap-2 px-2 h-[46px] border-b border-border bg-bg-elevated/30",
			children: [
				/* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: onExpand,
					title: i18nT("apps.specBuilder.components.specRail.show_specs"),
					"aria-label": i18nT("apps.specBuilder.components.specRail.show_spec_list"),
					className: "min-w-0 flex-1 flex items-center gap-2 h-9 px-1.5 rounded-md cursor-pointer bg-transparent border-none text-muted hover:text-text hover:bg-bg-hover transition-colors focus-ring",
					children: [
						/* @__PURE__ */ jsx(FileText, { className: "lucide-inline text-accent shrink-0" }),
						/* @__PURE__ */ jsx("span", {
							className: "min-w-0 truncate text-[13px] font-semibold text-text",
							children: i18nT("apps.specBuilder.components.specRail.spec_builder")
						}),
						/* @__PURE__ */ jsx(ChevronsRight, { className: "lucide-inline ml-auto shrink-0" })
					]
				}),
				/* @__PURE__ */ jsx("span", {
					"aria-live": "polite",
					className: "shrink-0 flex items-center",
					children: anyRunning && /* @__PURE__ */ jsx(PulseSpan, {
						title: i18nT("apps.specBuilder.components.specRail.agent_working"),
						"aria-label": i18nT("apps.specBuilder.components.specRail.an_agent_is_working"),
						className: "w-2 h-2 rounded-full block",
						style: { background: "var(--accent)" }
					})
				}),
				/* @__PURE__ */ jsx(Btn$1, {
					onClick: onNew,
					primary: true,
					title: i18nT("apps.specBuilder.components.specRail.new_spec"),
					ariaLabel: i18nT("apps.specBuilder.components.specRail.new_spec"),
					label: /* @__PURE__ */ jsx(Plus, { className: "lucide-inline" })
				})
			]
		});
		return /* @__PURE__ */ jsxs("aside", {
			style: { width },
			className: "shrink-0 flex flex-col items-center gap-2 pt-2.5 border-r border-border bg-bg-elevated/30",
			children: [
				/* @__PURE__ */ jsx(Btn$1, {
					onClick: onExpand,
					title: i18nT("apps.specBuilder.components.specRail.show_specs"),
					ariaLabel: i18nT("apps.specBuilder.components.specRail.show_spec_list"),
					label: /* @__PURE__ */ jsx(ChevronsRight, { className: "lucide-inline" })
				}),
				/* @__PURE__ */ jsx(Btn$1, {
					onClick: onNew,
					primary: true,
					title: i18nT("apps.specBuilder.components.specRail.new_spec"),
					ariaLabel: i18nT("apps.specBuilder.components.specRail.new_spec"),
					label: /* @__PURE__ */ jsx(Plus, { className: "lucide-inline" })
				}),
				/* @__PURE__ */ jsx("span", {
					"aria-live": "polite",
					children: anyRunning && /* @__PURE__ */ jsx(PulseSpan, {
						title: i18nT("apps.specBuilder.components.specRail.agent_working"),
						"aria-label": i18nT("apps.specBuilder.components.specRail.an_agent_is_working"),
						className: "w-2 h-2 rounded-full block",
						style: { background: "var(--accent)" }
					})
				}),
				/* @__PURE__ */ jsxs("span", {
					className: "mt-auto pb-3 flex flex-col items-center gap-2",
					children: [onSettings && /* @__PURE__ */ jsx(Btn$1, {
						onClick: onSettings,
						title: i18nT("apps.specBuilder.components.specRail.settings"),
						ariaLabel: i18nT("apps.specBuilder.components.specRail.spec_builder_settings"),
						label: /* @__PURE__ */ jsx(Settings, { className: "lucide-inline" })
					}), /* @__PURE__ */ jsx(FileText, { className: "lucide-inline text-accent shrink-0" })]
				})
			]
		});
	}
	const needle = filter.toLowerCase();
	const match = (s) => s.name.toLowerCase().includes(needle) || (s.title ?? "").toLowerCase().includes(needle);
	const working = specs.filter((s) => match(s) && !s.archived);
	const active = working.filter((s) => s.phase !== "tasks");
	const ready = working.filter((s) => s.phase === "tasks");
	const archived = specs.filter((s) => match(s) && s.archived);
	const groupHeader = (label, n) => /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-2 mx-1 mt-3.5 mb-1.5 text-[11px] font-bold text-muted",
		style: { letterSpacing: ".08em" },
		children: [
			/* @__PURE__ */ jsx("span", { children: label }),
			/* @__PURE__ */ jsx("span", { className: "flex-1 h-px bg-border" }),
			/* @__PURE__ */ jsx("span", { children: String(n) })
		]
	}, label);
	const row = (s) => {
		const selected = sel === s.name;
		const phaseLabel$1 = s.status === "executing" ? i18nT(PHASE_BUILDING_KEY) : s.phase === "tasks" ? i18nT(PHASE_READY_KEY) : phaseLabel(s.phase);
		const dotStyle = {
			background: s.phase === "tasks" && !s.running ? "var(--ok)" : ACCENT,
			opacity: s.phase === "tasks" || s.running ? 1 : .55
		};
		return /* @__PURE__ */ jsxs(Clickable, {
			onClick: () => setSel(s.name),
			"aria-current": selected || void 0,
			"aria-label": (s.title || s.name) + " — " + phaseLabel$1,
			className: "flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer mb-0.5 focus-ring",
			style: {
				background: selected ? SEL_BG : "transparent",
				border: "1px solid " + (selected ? SEL_BORDER : "transparent")
			},
			children: [
				s.running ? /* @__PURE__ */ jsx(PulseSpan, {
					className: "w-[7px] h-[7px] rounded-full shrink-0",
					style: dotStyle
				}) : /* @__PURE__ */ jsx("span", {
					className: "w-[7px] h-[7px] rounded-full shrink-0",
					style: dotStyle
				}),
				/* @__PURE__ */ jsx("span", {
					className: "text-[13px] font-medium overflow-hidden text-ellipsis whitespace-nowrap text-text flex-1 min-w-0",
					children: s.title || s.name
				}),
				/* @__PURE__ */ jsx("span", {
					className: "text-[11px] font-mono whitespace-nowrap",
					style: { color: s.status === "executing" ? "var(--ok)" : "var(--muted)" },
					children: phaseLabel$1
				})
			]
		}, s.name);
	};
	return /* @__PURE__ */ jsxs("aside", {
		style: { width },
		className: "shrink-0 min-h-0 flex flex-col border-r border-border bg-bg-elevated/30",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "shrink-0 px-2.5 py-2 border-b border-border",
				children: /* @__PURE__ */ jsx(Btn$1, {
					label: /* @__PURE__ */ jsxs(Fragment, { children: [
						/* @__PURE__ */ jsx(Plus, { className: "lucide-inline" }),
						" ",
						i18nT("apps.specBuilder.components.specRail.new_spec")
					] }),
					primary: true,
					onClick: onNew
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex-1 min-h-0 overflow-y-auto px-2 pt-2",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 mx-1 mb-1 text-[11px] font-bold text-muted",
						style: { letterSpacing: ".08em" },
						children: [
							/* @__PURE__ */ jsx("span", { children: i18nT("apps.specBuilder.components.specRail.specs") }),
							/* @__PURE__ */ jsx("span", { className: "flex-1" }),
							/* @__PURE__ */ jsx("span", { children: String(specs.length) })
						]
					}),
					/* @__PURE__ */ jsx(SearchInput, {
						value: filter,
						onChange: (e) => setFilter(e.target.value),
						placeholder: i18nT("apps.specBuilder.components.specRail.filter_specs"),
						"aria-label": i18nT("apps.specBuilder.components.specRail.filter_specs_by_name"),
						className: "mb-1"
					}),
					loading && specs.length === 0 ? /* @__PURE__ */ jsx(SpecListSkeleton, {}) : /* @__PURE__ */ jsxs(Fragment, { children: [
						active.length > 0 && groupHeader(i18nT("apps.specBuilder.components.specRail.active"), active.length),
						active.map(row),
						ready.length > 0 && groupHeader(i18nT("apps.specBuilder.components.specRail.plan_ready"), ready.length),
						ready.map(row),
						archived.length > 0 && groupHeader(i18nT("apps.meetings.review.archivedSection"), archived.length),
						archived.map(row),
						specs.length > 0 && active.length === 0 && ready.length === 0 && archived.length === 0 && /* @__PURE__ */ jsx(FilteredEmpty, {
							query: filter,
							onClear: () => setFilter("")
						})
					] })
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "shrink-0 border-t border-border px-3 py-2.5 flex items-center gap-2",
				children: [
					/* @__PURE__ */ jsx(FileText, { className: "lucide-inline text-accent shrink-0" }),
					/* @__PURE__ */ jsx("span", {
						className: "text-[13px] font-medium text-text",
						children: i18nT("apps.specBuilder.components.specRail.spec_builder")
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "text-[12px] text-muted opacity-70",
						children: [i18nT("apps.specBuilder.components.specRail.v"), APP_VERSION]
					}),
					/* @__PURE__ */ jsx("span", { className: "flex-1" }),
					onSettings && /* @__PURE__ */ jsx(Btn$1, {
						onClick: onSettings,
						title: i18nT("apps.specBuilder.components.specRail.settings"),
						ariaLabel: i18nT("apps.specBuilder.components.specRail.spec_builder_settings"),
						label: /* @__PURE__ */ jsx(Settings, { className: "lucide-inline" })
					})
				]
			})
		]
	});
}
// src/prompts.ts
/** Header for the batch of passage comments a review sends as one turn. */
var REVIEW_FEEDBACK_HEADER = "Review feedback on the spec documents — address each item below, then update the affected file(s):\n";
/** One numbered comment: the quoted passage followed by the reviewer's note. */
function reviewFeedbackItem(index, quote, feedback) {
	return index + ". Regarding this passage:\n> " + quote.replace(/\n/g, "\n> ") + "\n\n   Feedback: " + feedback;
}
/** Section header naming the document the following comments belong to. */
function reviewFeedbackFileHeader(file) {
	return "\n## " + file + "\n";
}
/**
* Sent as the next chat message when the user approves a phase, so the agent
* moves the spec forward. Agent-directed instruction text, never rendered --
* localising it would change what the model is told per user locale.
*
* Keyed by the phase being approved, matching ``ADVANCE`` in SpecDetail.tsx.
*/
var ADVANCE_PROMPT = {
	requirements: "Requirements approved — proceed to Phase 2 (Design). Keep .spec-state.json updated.",
	design: "Design approved — proceed to Phase 3 (Tasks). Keep .spec-state.json updated."
};
// src/host/Menu.tsx
/**
* A small overflow menu: a trigger button and a `role="menu"` list of items.
*
* The built-in used the dashboard's Radix `DropdownMenu`, which the App Kit does
* not export. This keeps the behaviour the page relies on: the trigger toggles
* the list, an item runs its `onSelect` and closes it, Escape closes it and
* hands focus back to the trigger, a press outside closes it, and the arrow keys
* move between the enabled items.
*/
var Ctx = createContext(null);
function useMenu() {
	const state = useContext(Ctx);
	if (!state) throw new Error("Menu parts must be rendered inside <DropdownMenu>");
	return state;
}
function DropdownMenu({ children }) {
	const [open, setOpen] = useState(false);
	const triggerRef = useRef(null);
	return /* @__PURE__ */ jsx(Ctx.Provider, {
		value: {
			open,
			setOpen,
			triggerRef
		},
		children: /* @__PURE__ */ jsx("span", {
			className: "relative inline-flex",
			children
		})
	});
}
function DropdownMenuTrigger({ children, onClick, ...rest }) {
	const { open, setOpen, triggerRef } = useMenu();
	return /* @__PURE__ */ jsx("button", {
		type: "button",
		ref: triggerRef,
		"aria-haspopup": "menu",
		"aria-expanded": open,
		onClick: (e) => {
			onClick?.(e);
			setOpen(!open);
		},
		...rest,
		children
	});
}
function DropdownMenuContent({ children, align = "start", className }) {
	const { open, setOpen, triggerRef } = useMenu();
	const listRef = useRef(null);
	const close = useCallback((refocus) => {
		setOpen(false);
		if (refocus) triggerRef.current?.focus();
	}, [setOpen, triggerRef]);
	useEffect(() => {
		if (!open) return;
		(listRef.current?.querySelector("[role=\"menuitem\"]:not([aria-disabled=\"true\"])"))?.focus();
		const onDown = (e) => {
			const target = e.target;
			if (!target) return;
			if (listRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
			close(false);
		};
		document.addEventListener("pointerdown", onDown);
		document.addEventListener("mousedown", onDown);
		return () => {
			document.removeEventListener("pointerdown", onDown);
			document.removeEventListener("mousedown", onDown);
		};
	}, [
		open,
		close,
		triggerRef
	]);
	if (!open) return null;
	const onKeyDown = (e) => {
		if (e.key === "Escape") {
			e.preventDefault();
			close(true);
			return;
		}
		if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
		e.preventDefault();
		const items = Array.from(listRef.current?.querySelectorAll("[role=\"menuitem\"]:not([aria-disabled=\"true\"])") ?? []);
		if (!items.length) return;
		const at = items.indexOf(document.activeElement);
		items[e.key === "ArrowDown" ? (at + 1) % items.length : (at - 1 + items.length) % items.length]?.focus();
	};
	return /* @__PURE__ */ jsx("div", {
		ref: listRef,
		role: "menu",
		tabIndex: -1,
		onKeyDown,
		className: "absolute top-full mt-1 z-50 flex flex-col py-1 rounded-lg border border-border bg-bg-elevated shadow-lg " + (align === "end" ? "right-0 " : "left-0 ") + (className ?? ""),
		children: /* @__PURE__ */ jsx(MenuClose.Provider, {
			value: close,
			children
		})
	});
}
var MenuClose = createContext(null);
function DropdownMenuItem({ children, onSelect, disabled, ...rest }) {
	const close = useContext(MenuClose);
	const run = () => {
		if (disabled) return;
		close?.(true);
		onSelect?.();
	};
	return /* @__PURE__ */ jsx("div", {
		role: "menuitem",
		tabIndex: disabled ? void 0 : -1,
		"aria-disabled": disabled || void 0,
		onClick: run,
		onKeyDown: (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				run();
			}
		},
		className: "flex items-center gap-2 px-3 py-1.5 text-[13px] text-text cursor-pointer outline-none hover:bg-bg-hover focus:bg-bg-hover " + (disabled ? "opacity-50 cursor-not-allowed" : ""),
		...rest,
		children
	});
}
// src/host/ResizeHandle.tsx
/** Px moved per arrow press, and per Shift+arrow press. */
var STEP = 16;
var COARSE_STEP = 64;
/** The vertical drag grip on a resizable column's edge, copied from the
* dashboard's `components/ResizeHandle` so this page's splitters look and behave
* like the dashboard's own. Pair it with `useColumnResize` (or any `usePointerDrag`)
* for `handleProps`, and `onNudge` for the arrow keys.
*
* Visual contract: a 6px transparent hit strip carrying a 2px `rounded-full`
* bar that stays invisible at rest, turns accent on hover and keyboard focus,
* and accent-hover while dragging. `inset` trims the bar's ends — pass the
* card's corner radius (12px for `rounded-xl`) when the grip runs along a
* rounded card edge so the accent spans exactly the straight segment of the
* border instead of overshooting the rounded corners.
*
* It is the ARIA window-splitter pattern, not a decorative divider: focusable,
* arrow-key operable, and reporting its position. Pointer-only would leave
* keyboard users unable to resize at all — and on a collapsible column, unable
* to reach the layout the mouse can. `value`/`min`/`max` are optional so the
* caller can omit them for a splitter whose extent isn't meaningful, but pass
* them when you have them: without `aria-valuenow` a screen reader announces a
* splitter with no position. */
function ResizeHandle({ handleProps, label, onNudge, value, min, max, inset = 0, className, title }) {
	return /* @__PURE__ */ jsx("div", {
		...handleProps,
		role: "separator",
		"aria-orientation": "vertical",
		"aria-label": label,
		tabIndex: onNudge ? 0 : void 0,
		"aria-valuenow": value,
		"aria-valuemin": min,
		"aria-valuemax": max,
		onKeyDown: onNudge ? (e) => {
			if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
			e.preventDefault();
			const step = e.shiftKey ? COARSE_STEP : STEP;
			onNudge(e.key === "ArrowRight" ? step : -step);
		} : void 0,
		title: title ?? i18nT("components.resizeHandle.drag_to_resize"),
		"data-testid": "resize-handle",
		className: cn("group/drag relative flex w-1.5 shrink-0 items-center justify-center cursor-col-resize select-none focus-ring rounded-full", className),
		style: { touchAction: "none" },
		children: /* @__PURE__ */ jsx("div", {
			"aria-hidden": "true",
			"data-testid": "resize-handle-bar",
			className: "w-[2px] rounded-full bg-transparent transition-colors duration-200 resize-accent group-hover/drag:bg-accent group-focus-visible/drag:bg-accent group-active/drag:bg-accent-hover",
			style: { height: inset > 0 ? `calc(100% - ${inset * 2}px)` : "100%" }
		})
	});
}
// src/components/ChatColumn.tsx
function ChatColumn({ name, slotKey, onSend }) {
	return /* @__PURE__ */ jsx("div", {
		className: "flex-1 min-h-0 flex flex-col",
		children: /* @__PURE__ */ jsx(ChatEmbed, {
			slotKey: slotKey || "spec-builder-" + name,
			onSend,
			placeholder: i18nT("apps.specBuilder.components.chatColumn.reply_to_the_spec_agent"),
			frameless: true,
			startAtBottom: true
		})
	});
}
// src/format.ts
/** *ratio* (0..1) as a percentage in the host's active language: the dashboard's
*  `fmtPercent`, which the App Kit does not export, over the SDK's `fmtNumber`. */
function fmtPercent(ratio, options) {
	if (!Number.isFinite(ratio)) return "—";
	return fmtNumber(ratio, {
		style: "percent",
		maximumFractionDigits: 0,
		...options
	});
}
// src/components/TaskList.tsx
function TaskList({ tasks, progress, pendingIndex, busy, onRun }) {
	if (!tasks.length) return /* @__PURE__ */ jsxs("div", {
		className: "h-full flex flex-col items-center justify-center gap-2.5 text-center px-6",
		children: [/* @__PURE__ */ jsx(ListChecks, {
			size: 26,
			strokeWidth: 1.5,
			className: "text-muted opacity-50"
		}), /* @__PURE__ */ jsx("div", {
			className: "text-[13px] text-muted max-w-[420px] leading-relaxed",
			children: i18nT("apps.specBuilder.components.taskList.no_tasks_yet")
		})]
	});
	const done = progress?.done ?? tasks.filter((t) => t.done).length;
	const total = progress?.total ?? tasks.length;
	const ratio = total ? done / total : 0;
	const pctWidth = Math.round(ratio * 100);
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col min-h-0",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "shrink-0 px-4 pt-3.5 pb-2.5 border-b border-border",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 mb-1.5",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "text-[12px] font-semibold text-text",
						children: i18nT("apps.specBuilder.components.taskList.done_of_total", {
							count: total,
							done: fmtNumber(done),
							total: fmtNumber(total)
						})
					}),
					/* @__PURE__ */ jsx("span", { className: "flex-1" }),
					/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-mono text-muted",
						children: fmtPercent(ratio)
					})
				]
			}), /* @__PURE__ */ jsx("div", {
				className: "h-1.5 rounded-full overflow-hidden",
				style: { background: "var(--border)" },
				role: "progressbar",
				"aria-valuenow": done,
				"aria-valuemin": 0,
				"aria-valuemax": total,
				"aria-label": i18nT("apps.specBuilder.components.taskList.task_progress"),
				children: /* @__PURE__ */ jsx("div", {
					className: "h-full rounded-full transition-all",
					style: {
						width: pctWidth + "%",
						background: ACCENT
					}
				})
			})]
		}), /* @__PURE__ */ jsx("ul", {
			className: "flex-1 min-h-0 overflow-y-auto px-2 py-1.5 list-none m-0",
			children: tasks.map((task) => {
				const pending = pendingIndex === task.index;
				return /* @__PURE__ */ jsxs("li", {
					className: "flex gap-2.5 items-start px-2 py-2 border-b border-border last:border-b-0",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "shrink-0 mt-[1px]",
							children: task.done ? /* @__PURE__ */ jsx(CheckCircle2, {
								size: 15,
								strokeWidth: 2,
								style: { color: "var(--ok)" }
							}) : pending ? /* @__PURE__ */ jsx(PulseSpan, {
								className: "block w-[13px] h-[13px] m-[1px] rounded-full",
								style: { background: ACCENT }
							}) : /* @__PURE__ */ jsx(Circle, {
								size: 15,
								strokeWidth: 1.75,
								className: "text-muted"
							})
						}),
						/* @__PURE__ */ jsx("span", {
							className: `flex-1 min-w-0 text-[13px] leading-snug ${task.done ? "text-muted line-through" : "text-text"}`,
							children: task.text
						}),
						task.done ? /* @__PURE__ */ jsx("span", {
							className: "text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 uppercase tracking-wide",
							style: {
								color: ACCENT,
								background: SEL_BG
							},
							children: i18nT("apps.specBuilder.components.taskList.done")
						}) : /* @__PURE__ */ jsx(Btn$1, {
							label: /* @__PURE__ */ jsxs(Fragment, { children: [
								/* @__PURE__ */ jsx(Play, { className: "lucide-inline" }),
								" ",
								pending ? i18nT("apps.specBuilder.components.taskList.starting") : i18nT("apps.specBuilder.components.taskList.run")
							] }),
							disabled: busy || pendingIndex !== null,
							ariaLabel: i18nT("apps.specBuilder.components.taskList.run_task", { task: task.text }),
							title: busy ? i18nT("apps.specBuilder.components.taskList.pause_the_build_first") : i18nT("apps.specBuilder.components.taskList.run_only_this_task_and_stop"),
							onClick: () => onRun(task)
						})
					]
				}, task.index + ":" + task.hash);
			})
		})]
	});
}
// src/host/selectionContainment.ts
/**
* Containment for a DOM selection, judged by text rather than by ancestry.
*
* `range.commonAncestorContainer` is the wrong predicate for a multi-click
* (double/triple-click) selection of a container's FIRST or LAST block, because
* browsers normalize such a selection to a boundary point just OUTSIDE the
* container: a triple-click paragraph selection ends "at the start of the next
* block", and for the last block that position lives in the container's PARENT.
* The common ancestor is hoisted above the container even though every selected
* character is inside it, so a bare `container.contains(range.commonAncestorContainer)`
* early-return dismisses a selection that is entirely the container's own.
*
* That is what made the chat selection toolbar appear for click-drag but not for
* double/triple-click on a message's last line (#7847), and the same predicate
* carried the same defect at two more surfaces (#7891): copying a user bubble's
* last line shipped the raw paste-chip label, and triple-clicking a spec
* document's last paragraph raised no Comment pill.
*/
/**
* The part of `range` that lies inside `container`, or `null` when the selection
* is not the container's to act on.
*
* A returned range is always clamped to the container, so callers can measure,
* stringify, or clone from it without an accepted overhang dragging the next
* block's line box or nodes into the result. The fast path returns the original
* range untouched, so the common case allocates nothing.
*
* Rejection has two tiers, and the order matters. The O(1) tier comes first:
* where the caller listens on `document` one instance per message, the N-1
* instances that do not own the selection must not fall through to
* stringification, which would serialize text growing with transcript distance
* on every event (select-all being the worst case). A boundary-normalized
* multi-click always keeps at least one endpoint inside its own container, so
* this tier never rejects the case the predicate exists for. Only then is the
* text tier consulted: clamp a clone to each side of the container and require
* both overhangs to hold no text, which keeps a selection genuinely spanning
* into a sibling rejected in either direction.
*/
function containedSelectionRange(range, container) {
	if (container.contains(range.commonAncestorContainer)) return range;
	const startInside = container.contains(range.startContainer);
	const endInside = container.contains(range.endContainer);
	if (!startInside && !endInside) return null;
	const before = range.cloneRange();
	before.setEnd(container, 0);
	const after = range.cloneRange();
	after.setStart(container, container.childNodes.length);
	if ((before.toString() + after.toString()).trim()) return null;
	const clamped = range.cloneRange();
	if (!startInside) clamped.setStart(container, 0);
	if (!endInside) clamped.setEnd(container, container.childNodes.length);
	return clamped;
}
// src/components/DocView.tsx
/** Catalog key per document tab; a literal Record of keys is the shape
*  check-i18n-keys.mjs resolves statically. */
var EMPTY_KEY = {
	requirements: "apps.specBuilder.components.docView.empty_requirements",
	design: "apps.specBuilder.components.docView.empty_design",
	tasks: "apps.specBuilder.components.docView.empty_tasks"
};
function DocView({ detail, tab, addComment, running = false, composer, runTask, pendingTaskIndex = null }) {
	const ime = useImeGuard();
	const fname = tab + ".md";
	const content = detail?.files?.[fname];
	const boxRef = useRef(null);
	const { sel, setSel, note, setNote, draft, setDraft } = composer;
	const [taskDocument, setTaskDocument] = useState(false);
	const onSelectionSettled = () => {
		const s = window.getSelection();
		const text = s ? s.toString().replace(/\s+/g, " ").trim() : "";
		if (!text || text.length < 3 || !boxRef.current || !s || !s.rangeCount) {
			setSel(null);
			return;
		}
		const contained = containedSelectionRange(s.getRangeAt(0), boxRef.current);
		if (!contained) {
			setSel(null);
			return;
		}
		const r = contained.getBoundingClientRect();
		const host = boxRef.current.getBoundingClientRect();
		setSel({
			text: text.slice(0, 500),
			x: r.left - host.left + r.width / 2,
			y: r.top - host.top + boxRef.current.scrollTop,
			tab
		});
	};
	const submit = () => {
		if (!draft.trim() || !note) return;
		addComment({
			file: note.tab + ".md",
			quote: note.text,
			note: draft.trim()
		});
		setNote(null);
		setDraft("");
		setSel(null);
	};
	useEffect(() => {
		const el = boxRef.current;
		if (!el) return;
		el.addEventListener("mouseup", onSelectionSettled);
		el.addEventListener("keyup", onSelectionSettled);
		return () => {
			el.removeEventListener("mouseup", onSelectionSettled);
			el.removeEventListener("keyup", onSelectionSettled);
		};
	});
	const hasTaskControls = tab === "tasks" && !!runTask && !!detail?.tasks?.length;
	const showTasks = hasTaskControls && !taskDocument;
	return /* @__PURE__ */ jsxs("div", {
		className: "flex-1 min-h-0 flex flex-col",
		children: [
			hasTaskControls && /* @__PURE__ */ jsxs("div", {
				className: "shrink-0 flex items-center gap-2 px-4 py-2 border-b border-border",
				children: [/* @__PURE__ */ jsx(Btn$1, {
					primary: !taskDocument,
					onClick: () => setTaskDocument(false),
					label: /* @__PURE__ */ jsxs(Fragment, { children: [
						/* @__PURE__ */ jsx(ListChecks, { className: "lucide-inline" }),
						" ",
						i18nT("apps.specBuilder.components.taskList.task_progress")
					] })
				}), /* @__PURE__ */ jsx(Btn$1, {
					primary: taskDocument,
					onClick: () => setTaskDocument(true),
					label: /* @__PURE__ */ jsxs(Fragment, { children: [
						/* @__PURE__ */ jsx(FileText, { className: "lucide-inline" }),
						" ",
						i18nT("apps.specBuilder.components.docView.document_file_name", { name: "tasks" })
					] })
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				ref: boxRef,
				className: "flex-1 min-h-0 overflow-y-auto text-[13px] relative",
				children: [showTasks ? /* @__PURE__ */ jsx(TaskList, {
					tasks: detail?.tasks ?? [],
					progress: detail?.task_progress,
					pendingIndex: pendingTaskIndex,
					busy: running || detail?.status === "executing",
					onRun: (t) => runTask?.(t)
				}) : content ? /* @__PURE__ */ jsx("div", {
					className: "px-5 py-[18px]",
					children: /* @__PURE__ */ jsx(MarkdownRenderer, { content })
				}) : running ? /* @__PURE__ */ jsx(DocSkeleton, {}) : /* @__PURE__ */ jsxs("div", {
					className: "h-full flex flex-col items-center justify-center gap-2.5 text-center px-6",
					children: [/* @__PURE__ */ jsx(FileText, {
						strokeWidth: 1.5,
						className: "lucide-inline text-muted opacity-50"
					}), /* @__PURE__ */ jsx("div", {
						className: "text-[13px] text-muted max-w-[420px] leading-relaxed",
						children: Object.prototype.hasOwnProperty.call(EMPTY_KEY, tab) ? i18nT(EMPTY_KEY[tab]) : i18nT("apps.specBuilder.components.docView.nothing_here_yet")
					})]
				}), sel && !note && /* @__PURE__ */ jsx("div", {
					className: "absolute z-[5]",
					style: {
						left: Math.max(8, Math.min(sel.x - 44, 600)),
						top: Math.max(4, sel.y - 34)
					},
					children: /* @__PURE__ */ jsx(Btn$1, {
						primary: true,
						onClick: () => {
							setNote(sel);
							setSel(null);
						},
						ariaLabel: i18nT("apps.specBuilder.components.docView.comment_on_the_selected_passage"),
						label: /* @__PURE__ */ jsxs(Fragment, { children: [
							/* @__PURE__ */ jsx(MessageSquare, { className: "lucide-inline" }),
							" ",
							i18nT("apps.specBuilder.components.docView.comment")
						] })
					})
				})]
			}),
			note && /* @__PURE__ */ jsxs("div", {
				className: "shrink-0 bg-card px-3.5 py-2.5",
				style: { borderTop: "2px solid var(--accent)" },
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 mb-[7px]",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0",
						style: {
							color: "var(--accent)",
							background: "color-mix(in srgb, var(--accent) 14%, transparent)"
						},
						children: i18nT("apps.specBuilder.components.docView.document_file_name", { name: note.tab })
					}), /* @__PURE__ */ jsxs("span", {
						className: "text-[11px] text-muted pl-2 overflow-hidden text-ellipsis whitespace-nowrap flex-1",
						style: { borderLeft: "3px solid var(--accent)" },
						children: [
							"“",
							note.text.slice(0, 140),
							note.text.length > 140 ? "…" : "",
							"”"
						]
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex gap-2",
					children: [
						/* @__PURE__ */ jsx(Input, {
							autoFocus: true,
							value: draft,
							onChange: (e) => setDraft(e.target.value),
							...ime.bindEnter({
								onEnter: submit,
								onEscape: () => {
									setNote(null);
									setDraft("");
								}
							}),
							placeholder: i18nT("apps.specBuilder.components.docView.your_feedback_on_this_passage_enter_adds_it_to_t"),
							"aria-label": i18nT("apps.specBuilder.components.docView.your_feedback_on_the_passage_in", { document: note.tab + ".md" }),
							className: "flex-1"
						}),
						/* @__PURE__ */ jsx(Btn$1, {
							label: /* @__PURE__ */ jsxs(Fragment, { children: [
								/* @__PURE__ */ jsx(Plus, { className: "lucide-inline" }),
								" ",
								i18nT("apps.specBuilder.components.docView.add_comment")
							] }),
							primary: true,
							disabled: !draft.trim(),
							onClick: submit
						}),
						/* @__PURE__ */ jsx(Btn$1, {
							label: /* @__PURE__ */ jsx(X, { className: "lucide-inline" }),
							ariaLabel: i18nT("apps.specBuilder.components.docView.discard_this_comment"),
							onClick: () => {
								setNote(null);
								setDraft("");
							}
						})
					]
				})]
			})
		]
	});
}
// src/components/SpecStatePanel.tsx
/** Refusal codes the backend emits BEFORE recording anything, so the optimistic
*  lock can be released and the user can answer again. Every other failure is
*  ambiguous — the write may have committed — and keeps the card locked until a
*  refetch says otherwise. */
var DEFINITELY_NOT_RECORDED = /* @__PURE__ */ new Set([
	"decision_agent_busy",
	"spec_busy_elsewhere",
	"decision_option_required",
	"decision_record_unreadable",
	"decision_record_write_failed",
	"decision_ledger_full",
	"stale_client",
	"slot_owned_by_another_app",
	"not_found",
	"text_required",
	"app_disabled",
	"unauthorized"
]);
/** Identity of a decision as this panel rendered it. The id alone is not enough:
*  the agent rewrites .spec-state.json wholesale, so an id can come back carrying
*  a DIFFERENT question — and a local "sent" mark keyed on the id alone would
*  then claim the new question was already answered. */
var decisionKey = (d) => d.id + "\0" + d.title;
function SpecStatePanel({ detail, answerDecision }) {
	const [answering, setAnswering] = useState(null);
	const [sent, setSent] = useState({});
	const settledIds = useRef(/* @__PURE__ */ new Set());
	const st = detail?.state;
	const ctx = detail?.context;
	useEffect(() => {
		if (!detail || settledIds.current.size === 0) return;
		const locked = new Set((Array.isArray(st?.decisions) ? st.decisions : []).filter((d) => !!d.locked || !!d.answer).map(decisionKey));
		const clearing = [...settledIds.current].filter((k) => !locked.has(k));
		if (!clearing.length) return;
		clearing.forEach((k) => settledIds.current.delete(k));
		setSent((s) => {
			const next = { ...s };
			clearing.forEach((k) => delete next[k]);
			return next;
		});
	}, [detail, st]);
	const busy = !!detail?.running;
	const decisions = Array.isArray(st?.decisions) ? st.decisions : [];
	const answer = async (d, opt) => {
		const key = decisionKey(d);
		setAnswering(d.id);
		setSent((s) => ({
			...s,
			[key]: opt
		}));
		try {
			await answerDecision(d.id, opt, i18nT("apps.specBuilder.components.specStatePanel.decision_title", { title: d.title }) + ": " + opt);
		} catch (e) {
			if (DEFINITELY_NOT_RECORDED.has(e?.code || "")) setSent((s) => {
				const { [key]: _drop, ...rest } = s;
				return rest;
			});
		} finally {
			settledIds.current.add(key);
			setAnswering(null);
		}
	};
	if (!decisions.length && !st?.blocking && !ctx) return null;
	const label = (t) => /* @__PURE__ */ jsx("div", {
		className: "sticky top-0 z-[2] text-[11px] leading-4 font-bold text-muted bg-bg pt-3 pb-1.5",
		style: { letterSpacing: ".08em" },
		children: t
	});
	const ctxRows = [
		...ctx?.worktree_branch ? [[i18nT("apps.specBuilder.components.specStatePanel.worktree"), ctx.worktree_branch]] : [],
		...st?.context?.template ? [[i18nT("apps.specBuilder.components.specStatePanel.template"), st.context.template]] : [],
		[i18nT("apps.specBuilder.components.specStatePanel.turns"), String(ctx?.turns ?? 0)],
		[i18nT("apps.specBuilder.components.specStatePanel.tool_calls"), String(ctx?.tool_calls ?? 0)]
	];
	return /* @__PURE__ */ jsx("div", {
		className: "shrink-0 flex flex-col border-t border-border bg-bg",
		style: { maxHeight: "46%" },
		children: /* @__PURE__ */ jsxs("div", {
			className: "overflow-y-auto px-3.5 pb-3.5",
			children: [
				decisions.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [label(i18nT("apps.specBuilder.components.specStatePanel.decisions")), decisions.map((d) => {
					const pending = !d.answer ? sent[decisionKey(d)] : void 0;
					const chosen = d.answer || pending || "";
					const settled = !!d.locked || !!chosen;
					return /* @__PURE__ */ jsxs("div", {
						className: "rounded-lg bg-card mb-2",
						style: { border: "1px solid " + (settled ? "var(--border)" : "color-mix(in srgb, var(--accent) 50%, transparent)") },
						children: [/* @__PURE__ */ jsxs("div", {
							className: "sticky top-[34px] z-[1] flex items-center gap-2 px-3.5 py-2.5 rounded-t-lg bg-card",
							style: { borderBottom: settled ? "none" : "1px solid var(--border)" },
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-[12.5px] font-semibold text-text flex-1",
								children: d.title
							}), /* @__PURE__ */ jsx("span", {
								className: "font-mono text-[11px] px-2 py-0.5 rounded-full shrink-0",
								style: {
									background: settled ? "color-mix(in srgb, var(--ok) 15%, transparent)" : "color-mix(in srgb, var(--accent) 14%, transparent)",
									color: settled ? "var(--ok)" : "var(--accent)"
								},
								children: d.answer || d.locked ? i18nT("apps.specBuilder.components.specStatePanel.answered") : pending ? i18nT("apps.specBuilder.components.specStatePanel.sending") : i18nT("apps.specBuilder.components.specStatePanel.pending")
							})]
						}), settled ? chosen ? /* @__PURE__ */ jsxs("div", {
							className: "text-[12px] text-muted px-3.5 pb-2.5",
							children: ["→ ", chosen]
						}) : null : /* @__PURE__ */ jsx("div", {
							className: "flex flex-col gap-1.5 px-3 py-3",
							role: "group",
							"aria-label": i18nT("apps.specBuilder.components.specStatePanel.options_for", { title: d.title }),
							children: (d.options || []).map((opt) => /* @__PURE__ */ jsxs(Clickable, {
								onClick: () => {
									if (!answering && !busy) answer(d, opt);
								},
								disabled: !!answering || busy,
								"aria-label": opt === d.recommended ? i18nT("apps.specBuilder.components.specStatePanel.answer_option_recommended", {
									title: d.title,
									option: opt
								}) : i18nT("apps.specBuilder.components.specStatePanel.answer_option", {
									title: d.title,
									option: opt
								}),
								className: "flex items-center gap-2.5 px-3 py-2 rounded-md border border-border focus-ring",
								style: {
									cursor: answering || busy ? "default" : "pointer",
									opacity: busy || answering && answering !== d.id ? .5 : 1
								},
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "w-[11px] h-[11px] rounded-full shrink-0",
										style: { border: "2px solid " + (opt === d.recommended ? "var(--accent)" : "var(--border)") }
									}),
									/* @__PURE__ */ jsx("span", {
										className: "text-[12.5px] text-text flex-1 leading-snug",
										children: opt
									}),
									opt === d.recommended && /* @__PURE__ */ jsx("span", {
										className: "font-mono text-[11px] shrink-0",
										style: {
											color: "var(--accent)",
											letterSpacing: ".06em"
										},
										children: i18nT("apps.specBuilder.components.specStatePanel.recommended")
									})
								]
							}, opt))
						})]
					}, d.id);
				})] }),
				st?.blocking && /* @__PURE__ */ jsxs(Fragment, { children: [label(i18nT("apps.specBuilder.components.specStatePanel.blocking")), /* @__PURE__ */ jsx("div", {
					className: "rounded-lg bg-card px-3.5 py-2.5 text-[12.5px] leading-relaxed text-text",
					style: { border: "1px solid color-mix(in srgb, var(--warn) 45%, transparent)" },
					children: st.blocking
				})] }),
				ctx && /* @__PURE__ */ jsxs(Fragment, { children: [label(i18nT("apps.specBuilder.components.specStatePanel.context")), /* @__PURE__ */ jsx("div", {
					className: "rounded-lg bg-card border border-border overflow-hidden",
					children: ctxRows.map(([k, v], i) => /* @__PURE__ */ jsxs("div", {
						className: "flex justify-between gap-2.5 px-3.5 py-[7px]" + (i < ctxRows.length - 1 ? " border-b border-border" : ""),
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-[12px] text-muted",
							children: k
						}), /* @__PURE__ */ jsx("span", {
							className: "font-mono text-[12px] text-text overflow-hidden text-ellipsis whitespace-nowrap",
							children: v
						})]
					}, k))
				})] })
			]
		})
	});
}
// src/host/NativeSelect.tsx
/**
* The fallback for `Select` on a host that does not export one: a plain native
* `<select>` with the same props, so the call sites do not branch.
*/
function NativeSelect({ options, optionLabels, value, onChange, clearLabel, disabled, "aria-label": ariaLabel, title, className }) {
	const emptyRow = clearLabel !== void 0 || !options.includes(value);
	return /* @__PURE__ */ jsxs("select", {
		value,
		onChange: (e) => onChange(e.target.value),
		disabled,
		"aria-label": ariaLabel,
		title,
		className: "text-sm px-2 py-1 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text)]" + (className ? ` ${className}` : ""),
		children: [emptyRow && /* @__PURE__ */ jsx("option", {
			value: "",
			children: clearLabel ?? ""
		}), options.map((option, index) => /* @__PURE__ */ jsx("option", {
			value: option,
			children: optionLabels?.[index] ?? option
		}, option))]
	});
}
// src/hostSdk.ts
/**
* Host names added at App Kit level 1, feature-detected.
*
* A named import of an export the host's module does not have fails the whole
* bundle at link time, so a host older than these seams would show a broken page
* instead of a slightly plainer one. These names are therefore read off namespace
* imports, each through an `in` check, and each has a local fallback. Names every
* supported host has are named-imported where they are used.
*/
/** The host's inline dropdown, or a native `<select>` on a host without one. */
var Select = ("Select" in ui ? ui.Select : void 0) ?? NativeSelect;
/** The guide's caution marker for a control that removes something; nothing on
*  a host without the guide seam. */
var guideCaution = ("guideCaution" in ui ? ui.guideCaution : void 0) ?? {};
// src/components/SpecDetail.tsx
/** Undo the body-wide cursor and selection lock the divider drag takes. */
function releaseDividerLock() {
	document.body.style.cursor = "";
	document.body.style.userSelect = "";
}
var DOC_TABS = [
	{
		id: "requirements",
		labelKey: "apps.specBuilder.components.specDetail.tab_requirements"
	},
	{
		id: "design",
		labelKey: "apps.specBuilder.components.specDetail.tab_design"
	},
	{
		id: "tasks",
		labelKey: "apps.specBuilder.components.specDetail.tab_tasks"
	}
];
var ADVANCE = {
	requirements: {
		labelKey: "apps.specBuilder.components.specDetail.advance_to_design",
		pendingKey: "apps.specBuilder.components.specDetail.drafting_design",
		target: "design",
		msg: ADVANCE_PROMPT.requirements
	},
	design: {
		labelKey: "apps.specBuilder.components.specDetail.advance_to_tasks",
		pendingKey: "apps.specBuilder.components.specDetail.drafting_tasks",
		target: "tasks",
		msg: ADVANCE_PROMPT.design
	}
};
function SpecDetail({ name, setErr, onDeleted, onDuplicated }) {
	const [tab, setTab] = useState("requirements");
	const [expanded, setExpanded] = useState(false);
	const [pendingRemove, setPendingRemove] = useState(null);
	const confirmDelete = pendingRemove !== null;
	const [docSel, setDocSel] = useState(null);
	const [docNote, setDocNote] = useState(null);
	const [docDraft, setDocDraft] = useState("");
	const docComposer = {
		sel: docSel,
		setSel: setDocSel,
		note: docNote,
		setNote: setDocNote,
		draft: docDraft,
		setDraft: setDocDraft
	};
	const isMobile = useIsMobile();
	const specId = () => ({
		spec_dir: detail?.spec_dir,
		slot_key: detail?.slot_key
	});
	const lastSendAt = useRef(0);
	const lastTasksHash = useRef(void 0);
	const lastTasksChangeAt = useRef(0);
	const detailQuery = useQuery({
		queryKey: [
			"spec-builder",
			"spec",
			name
		],
		queryFn: ({ signal }) => specApi.get(name, signal),
		refetchIntervalInBackground: true,
		refetchInterval: (q) => {
			const d = q.state.data;
			const hash = d?.docs?.["tasks.md"]?.hash;
			if (hash && lastTasksHash.current && hash !== lastTasksHash.current) lastTasksChangeAt.current = Date.now();
			if (hash) lastTasksHash.current = hash;
			return specDetailPollMs({
				running: d?.running,
				status: d?.status,
				watchingTasks: tab === "tasks",
				msSinceDispatch: Date.now() - lastSendAt.current,
				msSinceTasksChange: Date.now() - lastTasksChangeAt.current
			});
		}
	});
	const detail = detailQuery.data ?? null;
	const prevTab = useRef(tab);
	useEffect(() => {
		if (tab === "tasks" && prevTab.current !== "tasks") detailQuery.refetch();
		prevTab.current = tab;
	}, [tab, detailQuery]);
	useEffect(() => {
		if (detailQuery.error) setErr(detailQuery.error.message);
	}, [detailQuery.error, setErr]);
	const running = !!detail?.running;
	const executing = detail?.status === "executing";
	const hasIdentity = !!(detail?.spec_dir && detail?.slot_key);
	const bodyRef = useRef(null);
	const [docPct, setDocPctRaw] = useState(() => {
		try {
			const v = Number(localStorage.getItem(LS.docPct));
			return v >= 25 && v <= 75 ? v : 44;
		} catch {
			return 44;
		}
	});
	const setDocPct = (v) => {
		setDocPctRaw(v);
		try {
			localStorage.setItem(LS.docPct, String(v));
		} catch {}
	};
	const clampDocPct = (v) => Math.min(75, Math.max(25, v));
	const dividerDrag = usePointerDrag({
		threshold: 0,
		onStart: () => {
			document.body.style.cursor = "col-resize";
			document.body.style.userSelect = "none";
		},
		onMove: ({ x }) => {
			if (!bodyRef.current) return;
			const r = bodyRef.current.getBoundingClientRect();
			setDocPct(clampDocPct((r.right - x) / r.width * 100));
		},
		onEnd: releaseDividerLock
	});
	useEffect(() => releaseDividerLock, []);
	const nudgeDivider = (dx) => setDocPct(clampDocPct(docPct - dx / 4));
	useEffect(() => {
		if (!expanded || confirmDelete) return;
		const onKey = (e) => {
			if (e.key !== "Escape") return;
			e.preventDefault();
			setExpanded(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [expanded, confirmDelete]);
	const overlayRef = useRef(null);
	useEffect(() => {
		if (expanded) overlayRef.current?.focus();
	}, [expanded]);
	const hasTasks = !!detail?.files?.["tasks.md"];
	const queryClient = useQueryClient();
	const invalidate = useCallback(() => {
		detailQuery.refetch();
		return queryClient.invalidateQueries({ queryKey: ["spec-builder", "specs"] });
	}, [detailQuery, queryClient]);
	const executeMutation = useMutation({
		mutationFn: () => specApi.execute(name, specId()),
		onError: (e) => setErr(e.message),
		onSettled: invalidate
	});
	const stopMutation = useMutation({
		mutationFn: () => specApi.stop(name, specId()),
		onError: (e) => setErr(e.message),
		onSettled: invalidate
	});
	const deleteMutation = useMutation({
		mutationFn: (id) => specApi.remove(name, id),
		onSuccess: () => {
			setPendingRemove(null);
			queryClient.removeQueries({ queryKey: [
				"spec-builder",
				"spec",
				name
			] });
			queryClient.invalidateQueries({ queryKey: ["spec-builder", "specs"] });
			onDeleted?.();
		}
	});
	const messageMutation = useMutation({
		mutationFn: (msg) => specApi.message(name, msg, specId()),
		onMutate: () => {
			lastSendAt.current = Date.now();
		},
		onError: (e) => setErr(e.message),
		onSettled: invalidate
	});
	useEffect(() => {
		setDocSel(null);
	}, [expanded]);
	const decisionMutation = useMutation({
		mutationFn: (v) => specApi.answerDecision(name, v.id, v.option, v.msg, specId()),
		onError: (e) => setErr(e.message),
		onSettled: invalidate
	});
	const approveMutation = useMutation({
		mutationFn: (v) => specApi.approve(name, v.phase, v.hash, specId()),
		onError: (e) => setErr(e.message),
		onSettled: invalidate
	});
	const runTaskMutation = useMutation({
		mutationFn: (task) => specApi.runTask(name, task.index, task.hash, specId()),
		onMutate: () => {
			lastSendAt.current = Date.now();
		},
		onError: (e) => setErr(e.message),
		onSettled: invalidate
	});
	const titleMutation = useMutation({
		mutationFn: (title) => specApi.setTitle(name, title, specId()),
		onError: (e) => setErr(e.message),
		onSettled: invalidate
	});
	const archiveMutation = useMutation({
		mutationFn: (archived) => specApi.setArchived(name, archived, specId()),
		onError: (e) => setErr(e.message),
		onSettled: invalidate
	});
	const duplicateMutation = useMutation({
		mutationFn: (newName) => specApi.duplicate(name, newName, specId()),
		onSuccess: async (copy) => {
			await invalidate();
			onDuplicated?.(copy.name);
		},
		onError: (e) => setErr(e.message)
	});
	const [pendingTask, setPendingTask] = useState(null);
	const runTask = (task) => {
		setPendingTask(task.index);
		runTaskMutation.mutate(task, { onSettled: () => setPendingTask(null) });
	};
	const [titleDraft, setTitleDraft] = useState(null);
	const [dupDraft, setDupDraft] = useState(null);
	const commitTitle = () => {
		const next = (titleDraft ?? "").trim();
		setTitleDraft(null);
		if (next !== (detail?.title ?? "")) titleMutation.mutate(next);
	};
	const commitDuplicate = () => {
		const next = (dupDraft ?? "").trim();
		if (!next) return;
		duplicateMutation.mutate(next);
		setDupDraft(null);
	};
	const [advancing, setAdvancing] = useState(false);
	const [approved, setApproved] = useState(null);
	useEffect(() => {
		if (approved && detail?.phase && detail.phase !== approved) setApproved(null);
	}, [approved, detail?.phase]);
	const advance = async () => {
		const phase = detail?.phase;
		if (!phase || tab !== phase) return;
		const a = phase ? ADVANCE[phase] : void 0;
		const hash = phase ? detail?.docs?.[phase + ".md"]?.hash : void 0;
		if (!a || !hash) return;
		setAdvancing(true);
		try {
			await approveMutation.mutateAsync({
				phase,
				hash
			});
			await messageMutation.mutateAsync(a.msg);
			setApproved(phase);
			setTab(a.target);
		} catch {} finally {
			setAdvancing(false);
		}
	};
	const execute = () => executeMutation.mutate();
	const stop = () => stopMutation.mutate();
	const [comments, setComments] = useState([]);
	const [sendingAll, setSendingAll] = useState(false);
	const addComment = useCallback((c) => {
		setComments((cs) => [...cs, {
			...c,
			id: Date.now() + ":" + cs.length
		}]);
	}, []);
	const removeComment = (id) => setComments((cs) => cs.filter((c) => c.id !== id));
	const sendAll = async () => {
		if (!comments.length) return;
		setSendingAll(true);
		const byFile = {};
		for (const c of comments) (byFile[c.file] = byFile[c.file] || []).push(c);
		let msg = REVIEW_FEEDBACK_HEADER;
		for (const [file, items] of Object.entries(byFile)) {
			msg += reviewFeedbackFileHeader(file);
			items.forEach((c, idx) => {
				msg += reviewFeedbackItem(idx + 1, c.quote, c.note) + "\n\n";
			});
		}
		try {
			await messageMutation.mutateAsync(msg);
			setComments([]);
		} catch {} finally {
			setSendingAll(false);
		}
	};
	const docSegments = DOC_TABS.map((t, ti) => {
		const fname = t.id + ".md";
		const exists = !!detail?.files?.[fname];
		const firstMissing = DOC_TABS.findIndex((d) => !detail?.files?.[d.id + ".md"]);
		const status = exists ? "ready" : ti === firstMissing ? "pending" : "blocked";
		const dotColor = exists ? "var(--ok)" : status === "pending" ? "var(--warn)" : "var(--muted)";
		const dot = status === "pending" && running ? /* @__PURE__ */ jsx(PulseSpan, {
			className: "w-1.5 h-1.5 rounded-full inline-block",
			style: { background: dotColor }
		}) : /* @__PURE__ */ jsx("span", {
			className: "w-1.5 h-1.5 rounded-full inline-block",
			style: {
				background: dotColor,
				opacity: status === "blocked" ? .4 : 1
			}
		});
		return {
			key: t.id,
			label: i18nT(t.labelKey),
			icon: dot,
			tooltip: fname + " — " + status
		};
	});
	const phaseActions = () => /* @__PURE__ */ jsxs(Fragment, { children: [!executing && detail?.phase && ADVANCE[detail.phase] && (() => {
		const a = ADVANCE[detail.phase];
		const waiting = approved === detail.phase;
		const hasReviewHash = !!detail.docs?.[detail.phase + ".md"]?.hash;
		const reviewingPhase = tab === detail.phase;
		return /* @__PURE__ */ jsx(Btn$1, {
			label: advancing ? i18nT("apps.specBuilder.components.specDetail.sending") : waiting ? i18nT(a.pendingKey) : /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx(Play, { className: "lucide-inline" }),
				" ",
				i18nT(a.labelKey)
			] }),
			primary: !waiting,
			nowrap: true,
			disabled: advancing || messageMutation.isPending || waiting || !hasReviewHash || !reviewingPhase,
			title: !hasReviewHash ? i18nT("apps.specBuilder.components.docView.nothing_here_yet") : waiting ? i18nT("apps.specBuilder.components.specDetail.the_agent_is_writing_the_next_document") : i18nT("apps.specBuilder.components.specDetail.tells_the_agent_this_phase_is_approved_and_to_mo"),
			onClick: () => {
				advance();
			}
		});
	})(), executing ? /* @__PURE__ */ jsx(Btn$1, {
		label: /* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsx(Pause, { className: "lucide-inline" }),
			" ",
			stopMutation.isPending ? i18nT("apps.specBuilder.components.specDetail.pausing") : i18nT("apps.specBuilder.components.specDetail.pause")
		] }),
		danger: true,
		disabled: stopMutation.isPending,
		onClick: stop
	}) : hasTasks && /* @__PURE__ */ jsx(Btn$1, {
		label: /* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsx(Play, { className: "lucide-inline" }),
			" ",
			executeMutation.isPending ? i18nT("apps.specBuilder.components.specDetail.starting") : i18nT("apps.specBuilder.components.specDetail.start_building")
		] }),
		primary: true,
		disabled: executeMutation.isPending,
		title: i18nT("apps.specBuilder.components.specDetail.an_agent_will_work_through_the_task_list"),
		onClick: execute
	})] });
	const docTabsHeader = (fullscreen) => /* @__PURE__ */ jsxs("div", {
		className: "flex flex-wrap gap-1.5 items-center min-h-[52px] py-1.5 px-2.5 border-b border-border shrink-0",
		children: [
			/* @__PURE__ */ jsx(SegmentedControl, {
				segments: docSegments,
				value: tab,
				onChange: setTab,
				layoutId: fullscreen ? "sb-doc-tabs-full" : "sb-doc-tabs"
			}),
			(() => {
				const ap = detail?.approvals?.[tab];
				if (!ap) return null;
				return ap.stale ? /* @__PURE__ */ jsxs("span", {
					className: "flex items-center gap-1 text-[11px] font-semibold whitespace-nowrap shrink-0",
					style: { color: "var(--warn)" },
					title: i18nT("apps.specBuilder.components.specDetail.this_document_changed_after_it_was_approved"),
					children: [/* @__PURE__ */ jsx(AlertTriangle, {
						size: 12,
						strokeWidth: 2
					}), i18nT("apps.specBuilder.components.specDetail.changed_since_approval")]
				}) : /* @__PURE__ */ jsxs("span", {
					className: "flex items-center gap-1 text-[11px] font-semibold whitespace-nowrap shrink-0",
					style: { color: "var(--ok)" },
					title: ap.user ? i18nT("apps.specBuilder.components.specDetail.approved_by_user", { user: ap.user }) : i18nT("apps.specBuilder.components.specDetail.approved"),
					children: [/* @__PURE__ */ jsx(Check, {
						size: 12,
						strokeWidth: 2.5
					}), i18nT("apps.specBuilder.components.specDetail.approved")]
				});
			})(),
			/* @__PURE__ */ jsx("span", { className: "flex-1" }),
			/* @__PURE__ */ jsx(Btn$1, {
				onClick: () => setExpanded(!fullscreen),
				title: fullscreen ? i18nT("apps.specBuilder.components.specDetail.close_esc") : i18nT("apps.specBuilder.components.specDetail.expand_for_review_esc_to_close"),
				ariaLabel: fullscreen ? i18nT("apps.specBuilder.components.specDetail.close_review_view") : i18nT("apps.specBuilder.components.specDetail.expand_document_for_review"),
				label: fullscreen ? /* @__PURE__ */ jsx(Minimize2, { className: "lucide-inline" }) : /* @__PURE__ */ jsx(Maximize2, { className: "lucide-inline" })
			}),
			!expanded && phaseActions()
		]
	});
	return /* @__PURE__ */ jsxs("div", {
		ref: bodyRef,
		className: `flex flex-1 min-w-0 min-h-0 ${isMobile ? "flex-col" : ""}`,
		children: [
			/* @__PURE__ */ jsx("style", { children: DOC_CSS }),
			/* @__PURE__ */ jsxs("section", {
				className: "flex-1 min-w-0 min-h-0 flex flex-col",
				children: [
					/* @__PURE__ */ jsxs("header", {
						className: "shrink-0 h-[52px] px-4 border-b border-border flex items-center gap-2.5",
						children: [
							isMobile ? /* @__PURE__ */ jsx("span", {
								className: "text-[15px] font-bold tracking-tight text-text-strong overflow-hidden text-ellipsis whitespace-nowrap",
								children: detail?.title || name
							}) : /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setTitleDraft(detail?.title ?? ""),
								title: i18nT("apps.specBuilder.components.specDetail.rename_this_spec_label_the_folder_name_stays"),
								className: "group flex items-center gap-1.5 min-w-0 bg-transparent border-none p-0 cursor-pointer focus-ring rounded",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-[15px] font-bold tracking-tight text-text-strong overflow-hidden text-ellipsis whitespace-nowrap",
									children: detail?.title || name
								}), /* @__PURE__ */ jsx(Pencil, {
									size: 11,
									strokeWidth: 2,
									className: "text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
								})]
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-[12px] font-mono px-2.5 py-[3px] rounded-full whitespace-nowrap shrink-0",
								style: {
									color: ACCENT,
									background: SEL_BG
								},
								children: executing ? i18nT(PHASE_BUILDING_KEY) : phaseLabel(detail?.phase || "") || "…"
							}),
							/* @__PURE__ */ jsx("span", {
								"aria-live": "polite",
								className: "inline-flex items-center shrink-0",
								children: running && /* @__PURE__ */ jsxs("span", {
									className: "inline-flex items-center gap-1.5 text-[12px] font-semibold whitespace-nowrap",
									style: { color: "var(--accent)" },
									children: [/* @__PURE__ */ jsx(PulseSpan, {
										className: "w-[7px] h-[7px] rounded-full",
										style: { background: "var(--accent)" }
									}), i18nT("apps.specBuilder.components.specDetail.working")]
								})
							}),
							/* @__PURE__ */ jsx("span", { className: "flex-1 min-w-0" }),
							isMobile && /* @__PURE__ */ jsx(Btn$1, {
								onClick: () => setExpanded(true),
								title: i18nT("apps.specBuilder.components.specDetail.expand_for_review_esc_to_close"),
								ariaLabel: i18nT("apps.specBuilder.components.specDetail.expand_document_for_review"),
								label: /* @__PURE__ */ jsx(Maximize2, { className: "lucide-inline" })
							}),
							hasIdentity && titleDraft === null && dupDraft === null && /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
								"aria-label": i18nT("apps.issueRadar.components.detailOverflowMenu.more_actions"),
								title: i18nT("apps.issueRadar.components.detailOverflowMenu.more_actions"),
								className: "inline-flex items-center gap-1.5 px-2.5 py-1 border border-border bg-transparent text-text text-[13px] cursor-pointer font-body transition-all active:scale-[0.97] hover:border-border-strong hover:bg-bg-hover rounded-full focus-ring",
								children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "lucide-inline" })
							}), /* @__PURE__ */ jsxs(DropdownMenuContent, {
								align: "end",
								className: "min-w-[190px]",
								children: [
									/* @__PURE__ */ jsxs(DropdownMenuItem, {
										onSelect: () => {
											setDupDraft(null);
											setTitleDraft(detail?.title ?? "");
										},
										children: [/* @__PURE__ */ jsx(Pencil, {
											size: 13,
											className: "shrink-0 text-muted"
										}), /* @__PURE__ */ jsx("span", { children: i18nT("apps.specBuilder.components.specDetail.rename_this_spec_label_the_folder_name_stays") })]
									}),
									detail?.duplicate_supported !== false && /* @__PURE__ */ jsxs(DropdownMenuItem, {
										disabled: duplicateMutation.isPending,
										onSelect: () => {
											setTitleDraft(null);
											setDupDraft(name + "-copy");
										},
										children: [/* @__PURE__ */ jsx(Copy, {
											size: 13,
											className: "shrink-0 text-muted"
										}), /* @__PURE__ */ jsx("span", { children: i18nT("apps.specBuilder.components.specDetail.duplicate_this_spec") })]
									}),
									/* @__PURE__ */ jsxs(DropdownMenuItem, {
										disabled: archiveMutation.isPending,
										onSelect: () => archiveMutation.mutate(!detail?.archived),
										children: [detail?.archived ? /* @__PURE__ */ jsx(ArchiveRestore, {
											size: 13,
											className: "shrink-0 text-muted"
										}) : /* @__PURE__ */ jsx(Archive, {
											size: 13,
											className: "shrink-0 text-muted"
										}), /* @__PURE__ */ jsx("span", { children: detail?.archived ? i18nT("apps.specBuilder.components.specDetail.restore_this_spec") : i18nT("apps.specBuilder.components.specDetail.archive_this_spec") })]
									}),
									/* @__PURE__ */ jsxs(DropdownMenuItem, {
										"aria-label": i18nT("apps.specBuilder.components.specDetail.delete_spec_named", { name }),
										...guideCaution,
										disabled: deleteMutation.isPending,
										onSelect: () => {
											deleteMutation.reset();
											setPendingRemove(specId());
										},
										children: [/* @__PURE__ */ jsx(Trash2, { className: "lucide-inline shrink-0 text-danger" }), /* @__PURE__ */ jsx("span", {
											className: "text-danger",
											children: i18nT("apps.specBuilder.components.specDetail.delete_this_spec")
										})]
									})
								]
							})] }),
							!isMobile && /* @__PURE__ */ jsx("span", {
								className: "text-[11px] font-mono text-muted overflow-hidden text-ellipsis whitespace-nowrap max-w-[45%]",
								style: {
									direction: "rtl",
									textAlign: "right"
								},
								title: detail?.working_dir || "",
								children: detail?.working_dir || ""
							})
						]
					}),
					titleDraft !== null && /* @__PURE__ */ jsxs("div", {
						"data-testid": "title-form",
						className: "shrink-0 flex flex-col gap-2 px-4 py-3 border-b border-border bg-bg-elevated",
						children: [/* @__PURE__ */ jsx(Input, {
							autoFocus: true,
							value: titleDraft,
							onChange: (e) => setTitleDraft(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter") commitTitle();
								if (e.key === "Escape") setTitleDraft(null);
							},
							maxLength: 120,
							placeholder: name,
							"aria-label": i18nT("apps.specBuilder.components.specDetail.spec_label"),
							className: "w-full min-w-0"
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-end gap-2",
							children: [/* @__PURE__ */ jsx(Btn$1, {
								label: /* @__PURE__ */ jsx(X, { className: "lucide-inline" }),
								ariaLabel: i18nT("apps.specBuilder.components.specDetail.close_esc"),
								title: i18nT("apps.specBuilder.components.specDetail.close_esc"),
								onClick: () => setTitleDraft(null)
							}), /* @__PURE__ */ jsx(Btn$1, {
								label: i18nT("apps.specBuilder.components.settingsModal.save"),
								disabled: titleMutation.isPending,
								onClick: commitTitle
							})]
						})]
					}),
					dupDraft !== null && /* @__PURE__ */ jsxs("div", {
						"data-testid": "duplicate-form",
						className: "shrink-0 flex flex-col gap-2 px-4 py-3 border-b border-border bg-bg-elevated",
						children: [/* @__PURE__ */ jsx(Input, {
							autoFocus: true,
							value: dupDraft,
							onChange: (e) => setDupDraft(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter") commitDuplicate();
								if (e.key === "Escape") setDupDraft(null);
							},
							maxLength: 64,
							placeholder: i18nT("apps.specBuilder.components.specDetail.name_for_the_copy"),
							"aria-label": i18nT("apps.specBuilder.components.specDetail.name_for_the_copy"),
							className: "w-full min-w-0"
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-end gap-2",
							children: [/* @__PURE__ */ jsx(Btn$1, {
								label: /* @__PURE__ */ jsx(X, { className: "lucide-inline" }),
								ariaLabel: i18nT("apps.specBuilder.components.specDetail.close_esc"),
								title: i18nT("apps.specBuilder.components.specDetail.close_esc"),
								onClick: () => setDupDraft(null)
							}), /* @__PURE__ */ jsx(Btn$1, {
								label: i18nT("apps.specBuilder.components.specDetail.duplicate_this_spec"),
								disabled: !dupDraft.trim() || duplicateMutation.isPending,
								onClick: commitDuplicate
							})]
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "flex-1 min-h-0 flex flex-col",
						children: detail ? /* @__PURE__ */ jsx(ChatColumn, {
							name,
							slotKey: detail.slot_key,
							onSend: messageMutation.mutateAsync
						}) : /* @__PURE__ */ jsx(ChatColumnSkeleton, {})
					})
				]
			}),
			/* @__PURE__ */ jsx(ResizeHandle, {
				handleProps: dividerDrag,
				label: i18nT("apps.specBuilder.components.specDetail.resize_document_panel"),
				title: i18nT("apps.specBuilder.components.specDetail.drag_or_use_to_resize"),
				onNudge: nudgeDivider,
				value: Math.round(docPct),
				min: 25,
				max: 75,
				className: isMobile ? "hidden" : void 0
			}),
			/* @__PURE__ */ jsxs("section", {
				className: `min-w-0 flex flex-col ${isMobile ? "w-full min-h-0 border-t border-border max-h-[60vh] overflow-y-auto" : "border-l border-border"}`,
				style: isMobile ? void 0 : {
					flexBasis: docPct + "%",
					flexGrow: 0,
					flexShrink: 0
				},
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: `sb-doc flex flex-col overflow-hidden ${isMobile ? "shrink-0" : "flex-1 min-h-0"}`,
						children: [docTabsHeader(false), /* @__PURE__ */ jsx("div", {
							className: `flex-1 min-h-0 flex flex-col ${isMobile ? "hidden" : ""}`,
							children: !expanded && /* @__PURE__ */ jsx(DocView, {
								detail,
								tab,
								addComment,
								running,
								composer: docComposer,
								runTask,
								pendingTaskIndex: pendingTask
							})
						})]
					}),
					/* @__PURE__ */ jsx(SpecStatePanel, {
						detail,
						answerDecision: (id, option, msg) => decisionMutation.mutateAsync({
							id,
							option,
							msg
						})
					}),
					comments.length > 0 && /* @__PURE__ */ jsxs("div", {
						className: "mt-2.5 rounded-lg bg-bg shrink-0 max-h-[220px] flex flex-col",
						style: { border: "1px solid color-mix(in srgb, var(--accent) 45%, transparent)" },
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2 px-3 py-2 border-b border-border",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-[13px] font-semibold text-text flex-1",
									children: i18nT("apps.specBuilder.components.specDetail.pending_comment", { count: comments.length })
								}),
								/* @__PURE__ */ jsx(Btn$1, {
									label: i18nT("apps.specBuilder.components.specDetail.clear"),
									onClick: () => setComments([])
								}),
								/* @__PURE__ */ jsx(Btn$1, {
									label: sendingAll ? i18nT("apps.specBuilder.components.specDetail.sending") : /* @__PURE__ */ jsxs(Fragment, { children: [
										/* @__PURE__ */ jsx(MessageSquare, { className: "lucide-inline" }),
										" ",
										i18nT("apps.specBuilder.components.specDetail.send_all_to_agent")
									] }),
									primary: true,
									disabled: sendingAll,
									onClick: sendAll
								})
							]
						}), /* @__PURE__ */ jsx("div", {
							className: "overflow-y-auto px-2.5 py-1.5",
							children: comments.map((c) => /* @__PURE__ */ jsxs("div", {
								className: "flex gap-2 items-start px-1.5 py-[7px] border-b border-border",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0",
										style: {
											color: "var(--accent)",
											background: "color-mix(in srgb, var(--accent) 14%, transparent)"
										},
										children: c.file
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "text-[11px] text-muted overflow-hidden text-ellipsis whitespace-nowrap",
											children: [
												"“",
												c.quote,
												"”"
											]
										}), /* @__PURE__ */ jsx("div", {
											className: "text-[12px] text-text mt-0.5",
											children: c.note
										})]
									}),
									/* @__PURE__ */ jsx(Btn$1, {
										label: /* @__PURE__ */ jsx(X, { className: "lucide-inline" }),
										ariaLabel: i18nT("apps.specBuilder.components.specDetail.remove_comment_on", { document: c.file }),
										onClick: () => removeComment(c.id)
									})
								]
							}, c.id))
						})]
					})
				]
			}),
			expanded && /* @__PURE__ */ jsxs("div", {
				role: "dialog",
				"aria-modal": "true",
				"aria-label": i18nT("apps.specBuilder.components.specDetail.review_document_named", {
					document: tab,
					name
				}),
				tabIndex: -1,
				ref: overlayRef,
				className: "absolute inset-0 z-[60] bg-bg flex flex-col outline-hidden",
				style: { padding: "14px 26px 20px" },
				children: [
					/* @__PURE__ */ jsx("style", { children: ".sb-doc img, .sb-doc svg { max-width: 100%; height: auto } .sb-doc pre { overflow-x: auto }" }),
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2.5 mb-2.5 shrink-0 flex-wrap",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-[15px] font-bold text-text-strong",
								children: name
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-[12px] font-mono px-2.5 py-[3px] rounded-full",
								style: {
									color: "var(--accent)",
									background: "color-mix(in srgb, var(--accent) 14%, transparent)"
								},
								children: i18nT("apps.specBuilder.components.specDetail.document_file_name", { name: tab })
							}),
							/* @__PURE__ */ jsx("span", { className: "flex-1" }),
							/* @__PURE__ */ jsx(SegmentedControl, {
								segments: DOC_TABS.map((t) => ({
									key: t.id,
									label: i18nT(t.labelKey)
								})),
								value: tab,
								onChange: setTab,
								layoutId: "sb-doc-tabs-overlay"
							}),
							phaseActions(),
							/* @__PURE__ */ jsx(Btn$1, {
								onClick: () => setExpanded(false),
								title: i18nT("apps.specBuilder.components.specDetail.close_esc"),
								ariaLabel: i18nT("apps.specBuilder.components.specDetail.close_review_view"),
								label: /* @__PURE__ */ jsx(Minimize2, { className: "lucide-inline" })
							})
						]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "flex-1 min-h-0 flex justify-center",
						children: /* @__PURE__ */ jsx("div", {
							className: "sb-doc flex flex-col border border-border rounded-lg bg-card overflow-hidden min-h-0",
							style: { width: "min(980px, 100%)" },
							children: /* @__PURE__ */ jsx(DocView, {
								detail,
								tab,
								addComment,
								running,
								composer: docComposer,
								runTask,
								pendingTaskIndex: pendingTask
							})
						})
					})
				]
			}),
			confirmDelete && /* @__PURE__ */ jsxs(Modal, {
				open: true,
				onClose: () => {
					if (!deleteMutation.isPending) setPendingRemove(null);
				},
				title: i18nT("apps.specBuilder.components.specDetail.remove_this_spec"),
				maxWidth: 440,
				footer: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Btn$1, {
					label: i18nT("apps.specBuilder.components.specDetail.cancel"),
					disabled: deleteMutation.isPending,
					onClick: () => setPendingRemove(null)
				}), /* @__PURE__ */ jsx(Btn$1, {
					label: deleteMutation.isPending ? i18nT("apps.specBuilder.components.specDetail.removing") : i18nT("apps.specBuilder.components.specDetail.delete_this_spec"),
					danger: true,
					disabled: deleteMutation.isPending || !pendingRemove,
					onClick: () => {
						if (pendingRemove) deleteMutation.mutate(pendingRemove);
					}
				})] }),
				children: [/* @__PURE__ */ jsx("p", {
					className: "text-[13px] leading-relaxed text-text m-0 break-words",
					children: i18nT("apps.specBuilder.components.specDetail.remove_spec_body", { name })
				}), /* @__PURE__ */ jsx(ErrorNotice, {
					className: "mt-2.5",
					title: i18nT("apps.specBuilder.components.specDetail.couldn_t_remove_this_spec_try_again"),
					message: deleteMutation.error ? deleteMutation.error.message : null
				})]
			})
		]
	});
}
// src/components/ColumnSplitter.tsx
function ColumnSplitter({ handleProps, label, valueNow, valueMin, valueMax, onNudge }) {
	return /* @__PURE__ */ jsx(ResizeHandle, {
		handleProps,
		label,
		title: i18nT("apps.specBuilder.components.columnSplitter.drag_or_use_to_resize"),
		onNudge: (dx) => onNudge(dx / 16),
		value: Math.round(valueNow),
		min: valueMin,
		max: valueMax
	});
}
// src/components/Workspace.tsx
var RAIL_COLLAPSE = {
	width: 44,
	storageKey: LS.railCollapsed,
	whenNarrow: true
};
function Workspace({ specs, sel, setSel, setErr, onNew, loading = false, onSettings }) {
	const firstRun = specs.length === 0 && !loading;
	const rail = useColumnResize(LS.railWidth, loadRailWidth, 190, 420, RAIL_COLLAPSE, loadRailCollapsed);
	const isMobile = useIsMobile();
	const railBar = isMobile && rail.collapsed;
	const railFull = isMobile && !rail.collapsed;
	const selectSpec = (name) => {
		setSel(name);
		if (isMobile) rail.collapse();
	};
	return /* @__PURE__ */ jsxs("div", {
		className: `flex flex-1 min-h-0 ${railBar ? "flex-col" : ""}`,
		children: [
			/* @__PURE__ */ jsx(SpecRail, {
				specs,
				sel,
				setSel: selectSpec,
				onNew,
				loading,
				onSettings,
				width: railFull ? "100%" : rail.width,
				collapsed: rail.collapsed,
				horizontal: railBar,
				onExpand: rail.expand
			}),
			!isMobile && /* @__PURE__ */ jsx(ColumnSplitter, {
				handleProps: rail.handleProps,
				label: i18nT("apps.specBuilder.components.workspace.resize_spec_list"),
				valueNow: rail.width,
				valueMin: 44,
				valueMax: 420,
				onNudge: (d) => rail.nudge(d * 16)
			}),
			/* @__PURE__ */ jsx("div", {
				className: `flex-1 min-w-0 min-h-0 ${railFull ? "hidden" : "flex"}`,
				children: firstRun ? /* @__PURE__ */ jsxs("div", {
					className: "flex-1 min-w-0 flex flex-col items-center justify-center",
					children: [/* @__PURE__ */ jsx(EmptyState, {
						icon: /* @__PURE__ */ jsx(FileText, { className: "lucide-inline text-accent opacity-50" }),
						title: i18nT("apps.specBuilder.components.workspace.plan_your_next_feature_with_a_spec"),
						subtitle: i18nT("apps.specBuilder.components.workspace.describe_what_you_want_to_build_answer_a_few_que")
					}), /* @__PURE__ */ jsx(Btn$1, {
						label: i18nT("apps.specBuilder.components.workspace.start_your_first_spec"),
						primary: true,
						big: true,
						onClick: onNew
					})]
				}) : sel && specs.some((s) => s.name === sel) ? /* @__PURE__ */ jsx(SpecDetail, {
					name: sel,
					setErr,
					onDeleted: () => setSel(null),
					onDuplicated: selectSpec
				}, sel) : /* @__PURE__ */ jsxs("div", {
					className: "flex-1 min-w-0 flex items-center justify-center text-muted text-[13px] gap-1.5",
					children: [
						isMobile ? /* @__PURE__ */ jsx(ArrowUp, { className: "lucide-inline" }) : /* @__PURE__ */ jsx(ArrowLeft, { className: "lucide-inline" }),
						" ",
						i18nT("apps.specBuilder.components.workspace.pick_a_spec_to_continue_where_you_left_off")
					]
				})
			})
		]
	});
}
// src/host/thunkError.ts
/** The readable message of a thrown value, or '' (from the dashboard's `utils/thunkError`). */
function errMessage(e) {
	if (e instanceof Error) return e.message;
	if (e && typeof e === "object") {
		const { message } = e;
		return typeof message === "string" ? message : "";
	}
	return e == null ? "" : String(e);
}
// src/host/pathBasename.ts
/** Separator-aware file-name helpers for gateway paths shown in the UI.
*
*  A Windows gateway reports native paths (`C:\repo\src\a.ts`,
*  `\\host\share\a.ts`), so splitting on `/` alone shows the whole path where a
*  file name belongs. Splitting on `\` everywhere is wrong too: on POSIX a
*  backslash is a legal file-name character, so `/tmp/we\ird.md` is ONE name.
*  The rule here is the one `breadcrumbSegments` (MarkdownPanelHeader.tsx) uses: `\`
*  is a separator only when the path itself is Windows-shaped -- drive-rooted
*  (`C:\`, `C:/`) or a backslash UNC path (`\\host\`).
*
*  This module is display-only: it decides which characters to SHOW, never
*  which paths may be read. The security-relevant predicate stays
*  `WINDOWS_ABS_PATH_RE` in urlTransform.ts, which deliberately excludes UNC.
*  The regex below is the one definition of that shape: fileTokens.ts imports
*  it for `normalizeWindowsPath` rather than keeping its own copy. */
/** Drive-rooted (`C:\…`, `C:/…`) or backslash-UNC (`\\host\…`) path. */
var WINDOWS_SHAPED_PATH_RE = /^(?:[A-Za-z]:|\\\\[^\\/]+)[\\/]/;
/** Whether `\` separates segments in `p` (see the module comment). */
function backslashIsSeparator(p) {
	return WINDOWS_SHAPED_PATH_RE.test(p);
}
/** The text after the last separator of `p`; `''` when `p` ends with one.
*  For a POSIX path this is exactly `p.split('/').pop()`. */
function pathBasename(p) {
	const cut = backslashIsSeparator(p) ? Math.max(p.lastIndexOf("/"), p.lastIndexOf("\\")) : p.lastIndexOf("/");
	return p.slice(cut + 1);
}
/** `p` without its trailing separators. For a POSIX path this is exactly
*  `p.replace(/\/+$/, '')`; a Windows-shaped path also drops trailing `\`. */
function stripTrailingSeparators(p) {
	return p.replace(backslashIsSeparator(p) ? /[\\/]+$/ : /\/+$/, "");
}
// src/components/ProjectPicker.tsx
var base = (p) => pathBasename(stripTrailingSeparators(p)) || p;
function ProjectPicker({ value, onChange }) {
	const [open, setOpen] = useState(false);
	const [recents, setRecents] = useState([]);
	const [cwd, setCwd] = useState("");
	const [parent, setParent] = useState("");
	const [dirs, setDirs] = useState([]);
	const [manual, setManual] = useState(false);
	const [atStart, setAtStart] = useState(true);
	const recentsQuery = useQuery({
		queryKey: [
			"spec-builder",
			"browse",
			""
		],
		queryFn: ({ signal }) => specApi.browse("", signal)
	});
	useEffect(() => {
		if (recentsQuery.data) setRecents(recentsQuery.data.recents || []);
	}, [recentsQuery.data]);
	const [navPath, setNavPath] = useState(null);
	const navQuery = useQuery({
		queryKey: [
			"spec-builder",
			"browse",
			navPath ?? ""
		],
		queryFn: ({ signal }) => specApi.browse(navPath ?? "", signal),
		enabled: navPath !== null
	});
	useEffect(() => {
		const d = navQuery.data;
		if (!d || navPath === null) return;
		setCwd(d.path);
		setParent(d.parent);
		setDirs(d.dirs || []);
		if (d.recents) setRecents(d.recents);
	}, [navQuery.data, navPath]);
	const loading = navQuery.isFetching;
	const listFailed = navPath !== null && navQuery.isError && !loading;
	const browse = (path, fromStart) => {
		setNavPath(path || "");
		setAtStart(!!fromStart);
		setOpen(true);
	};
	const pick = (path) => {
		onChange(path);
		setOpen(false);
	};
	const canGoUp = !!parent && parent !== cwd;
	const rowCls = "sb-row flex gap-2.5 items-center px-4 py-2.5 text-[13px] cursor-pointer text-text focus-ring";
	const sectionLabel = (t) => /* @__PURE__ */ jsx("div", {
		className: "px-4 pt-2 pb-1 text-[11px] font-bold uppercase text-muted",
		style: { letterSpacing: ".06em" },
		children: t
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "mb-6 max-w-[680px]",
		children: [
			/* @__PURE__ */ jsx("style", { children: PICKER_CSS }),
			/* @__PURE__ */ jsxs(Clickable, {
				className: "sb-field flex items-center gap-2.5 px-3.5 py-3 rounded-lg bg-bg cursor-pointer focus-ring",
				style: { border: "1px solid " + (value ? "color-mix(in srgb, var(--accent) 50%, transparent)" : "var(--border)") },
				onClick: () => open ? setOpen(false) : browse(value || "", !value),
				"aria-expanded": open,
				"aria-label": value ? i18nT("apps.specBuilder.components.projectPicker.project_folder_change", { path: value }) : i18nT("apps.specBuilder.components.projectPicker.choose_a_project_folder_aria"),
				children: [/* @__PURE__ */ jsx(Folder, { className: "lucide-inline text-accent shrink-0" }), value ? /* @__PURE__ */ jsxs(Fragment, { children: [
					/* @__PURE__ */ jsx("span", {
						className: "text-[13px] font-semibold text-text whitespace-nowrap",
						children: base(value)
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-[12px] text-muted overflow-hidden text-ellipsis whitespace-nowrap flex-1",
						style: {
							direction: "rtl",
							textAlign: "left"
						},
						children: value
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-[12px] font-semibold whitespace-nowrap",
						style: { color: ACCENT },
						children: i18nT("apps.specBuilder.components.projectPicker.change")
					})
				] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
					className: "text-[13px] text-muted flex-1",
					children: i18nT("apps.specBuilder.components.projectPicker.choose_a_project_folder")
				}), open ? /* @__PURE__ */ jsx(ChevronUp, { className: "lucide-inline text-accent" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "lucide-inline text-accent" })] })]
			}),
			open && /* @__PURE__ */ jsxs("div", {
				className: "mt-2 border border-border rounded-lg bg-bg max-h-[320px] overflow-y-auto shadow-xl",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border sticky top-0 bg-bg z-[1]",
						children: [
							/* @__PURE__ */ jsx(Btn$1, {
								onClick: () => {
									if (canGoUp) browse(parent);
								},
								disabled: !canGoUp,
								ariaLabel: i18nT("apps.specBuilder.components.projectPicker.go_to_parent_folder"),
								label: /* @__PURE__ */ jsxs(Fragment, { children: [
									/* @__PURE__ */ jsx(ArrowUp, { className: "lucide-inline" }),
									" ",
									i18nT("apps.specBuilder.components.projectPicker.up")
								] })
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-[12px] text-text/80 overflow-hidden text-ellipsis whitespace-nowrap flex-1",
								style: {
									direction: "rtl",
									textAlign: "left"
								},
								"aria-live": "polite",
								children: loading ? i18nT("apps.specBuilder.components.projectPicker.loading") : cwd
							}),
							/* @__PURE__ */ jsx(Btn$1, {
								primary: true,
								disabled: loading || !cwd,
								onClick: () => pick(cwd),
								ariaLabel: i18nT("apps.specBuilder.components.projectPicker.use_this_folder_path", { path: cwd }),
								label: /* @__PURE__ */ jsxs(Fragment, { children: [
									/* @__PURE__ */ jsx(Check, { className: "lucide-inline" }),
									" ",
									i18nT("apps.specBuilder.components.projectPicker.use_this_folder")
								] })
							})
						]
					}),
					atStart && recents.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
						sectionLabel(i18nT("apps.specBuilder.components.projectPicker.recent_projects")),
						recents.slice(0, 6).map((p) => /* @__PURE__ */ jsxs(Clickable, {
							className: rowCls,
							onClick: () => pick(p),
							"aria-label": i18nT("apps.specBuilder.components.projectPicker.use_recent_project", { path: p }),
							children: [
								/* @__PURE__ */ jsx(Clock, { className: "lucide-inline text-muted" }),
								/* @__PURE__ */ jsx("span", {
									className: "font-semibold",
									children: base(p)
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-muted overflow-hidden text-ellipsis whitespace-nowrap flex-1",
									style: {
										direction: "rtl",
										textAlign: "left"
									},
									children: p
								})
							]
						}, p)),
						sectionLabel(i18nT("apps.specBuilder.components.projectPicker.browse"))
					] }),
					listFailed && /* @__PURE__ */ jsxs("div", {
						className: "px-4 py-3 flex flex-col items-start gap-2",
						children: [/* @__PURE__ */ jsx(ErrorNotice, {
							testId: "spec-builder-picker-error",
							title: i18nT("apps.specBuilder.components.projectPicker.load_failed"),
							message: errMessage(navQuery.error) || i18nT("apps.specBuilder.components.projectPicker.load_failed_unknown"),
							messagePlacement: "below",
							className: "w-full"
						}), /* @__PURE__ */ jsx(Btn$1, {
							onClick: () => void navQuery.refetch(),
							label: i18nT("apps.specBuilder.components.projectPicker.retry")
						})]
					}),
					dirs.length === 0 && !loading && !listFailed && /* @__PURE__ */ jsx("div", {
						className: "px-4 py-3.5 text-[12px] text-muted",
						children: i18nT("apps.specBuilder.components.projectPicker.no_subfolders_here_use_use_this_folder_above_to")
					}),
					dirs.map((d) => /* @__PURE__ */ jsxs(Clickable, {
						className: rowCls,
						onClick: () => browse(d.path),
						"aria-label": i18nT("apps.specBuilder.components.projectPicker.open_folder", { name: d.name }),
						children: [
							/* @__PURE__ */ jsx(Folder, { className: "lucide-inline text-muted" }),
							/* @__PURE__ */ jsx("span", {
								className: "flex-1",
								children: d.name
							}),
							/* @__PURE__ */ jsx(ChevronRight, { className: "lucide-inline text-muted" })
						]
					}, d.path)),
					/* @__PURE__ */ jsx(Clickable, {
						onClick: () => setManual(!manual),
						className: "px-4 py-2.5 text-[12px] text-muted cursor-pointer border-t border-border underline focus-ring",
						"aria-expanded": manual,
						children: manual ? i18nT("apps.specBuilder.components.projectPicker.hide_path_input") : i18nT("apps.specBuilder.components.projectPicker.type_a_path_instead")
					})
				]
			}),
			manual && /* @__PURE__ */ jsx(Input, {
				value,
				onChange: (e) => onChange(e.target.value),
				placeholder: i18nT("apps.specBuilder.components.projectPicker.home_you_projects_my_app"),
				"aria-label": i18nT("apps.specBuilder.components.projectPicker.project_folder_path"),
				className: "mt-2 w-full"
			})
		]
	});
}
// src/host/RadioChipGroup.tsx
/**
* One-of-N choice drawn as a row of buttons (chips, swatches, mode buttons),
* announced and operated as a radio group (WAI-ARIA radio pattern).
*
* Why not `aria-pressed`: `aria-pressed` reads as N independent on/off toggles,
* so a screen-reader user hears "pressed" / "not pressed" per button and is
* never told the buttons are one single-select set (#27459). A genuine two-state
* toggle (one button that is on or off, or a pair where pressing the active one
* clears it) keeps `aria-pressed` and does not use this group.
*
* How to use: wrap the options in `<RadioChipGroup>` with a name
* (`ariaLabel` or `ariaLabelledBy`), and give each option `{...radioChip(checked)}`
* instead of `aria-pressed`. Options must be focusable elements (`<button>`).
*
* The group owns the keyboard behaviour so no call site re-implements it:
* - One Tab stop. While focus is inside the group it is the focused option;
*   otherwise it is the checked option, or the first enabled one when none is
*   checked. The group sets each option's `tabIndex` itself, so options must
*   NOT pass their own `tabIndex` prop.
* - Arrow keys (Right/Down next, Left/Up previous, wrapping) and Home/End move
*   focus; disabled options are skipped. By default they do NOT select: many
*   consumers save on every change (settings write config, a palette saves and
*   closes, the guide's pick list commits and unmounts), so passing over an
*   option must never persist it. Space/Enter (the native button click)
*   chooses. This is the rule `SegmentedControl` already follows.
* - `selectOnArrow` opts a group into "arrow moves AND selects" (the native
*   radio behaviour), for a group where a pick is cheap and reversible and
*   that behaviour is already established (the sidebar duration chips, #22330).
* - The key is consumed (`stopPropagation`) so a host Radix menu does not also
*   treat it as its own item-to-item navigation and pull focus out.
*/
function RadioChipGroup({ ariaLabel, ariaLabelledBy, className, style, children, onKeyDown: ownKeyDown, selectOnArrow = false, "data-testid": testId }) {
	const ref = useRef(null);
	useLayoutEffect(() => {
		if (ref.current) placeTabStop(ref.current);
	});
	const onKeyDown = (e) => {
		ownKeyDown?.(e);
		if (e.defaultPrevented) return;
		if (!(e.key === "Home" || e.key === "End") && RADIO_KEY_STEP[e.key] === void 0) return;
		const radios = ownRadios(e.currentTarget).filter((r) => !isDisabled(r));
		if (radios.length === 0) return;
		e.preventDefault();
		e.stopPropagation();
		const current = radios.indexOf(document.activeElement);
		const next = e.key === "Home" ? 0 : e.key === "End" ? radios.length - 1 : (Math.max(current, 0) + RADIO_KEY_STEP[e.key] + radios.length) % radios.length;
		radios[next].focus();
		if (selectOnArrow) radios[next].click();
	};
	return /* @__PURE__ */ jsx("div", {
		ref,
		role: "radiogroup",
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledBy,
		className,
		style,
		onKeyDown,
		"data-testid": testId,
		onFocus: (e) => placeTabStop(e.currentTarget),
		onBlur: (e) => {
			const group = e.currentTarget;
			if (!group.contains(e.relatedTarget)) placeTabStop(group, true);
		},
		children
	});
}
/** The attributes an option inside a `RadioChipGroup` carries in place of
*  `aria-pressed`. */
function radioChip(checked) {
	return {
		role: "radio",
		"aria-checked": checked
	};
}
/** Arrow-key step through a radio group (WAI-ARIA radio pattern: Right/Down is
*  the next radio, Left/Up the previous, wrapping at either end). */
var RADIO_KEY_STEP = {
	ArrowRight: 1,
	ArrowDown: 1,
	ArrowLeft: -1,
	ArrowUp: -1
};
/** Give exactly one of the group's own enabled radios `tabIndex` 0: the
*  focused one while focus is inside (unless `leaving`), else the checked one,
*  else the first. */
function placeTabStop(group, leaving = false) {
	const radios = ownRadios(group);
	const enabled = radios.filter((r) => !isDisabled(r));
	const stop = (leaving ? void 0 : enabled.find((r) => r === document.activeElement)) ?? enabled.find((r) => r.getAttribute("aria-checked") === "true") ?? enabled[0];
	for (const r of radios) r.tabIndex = r === stop ? 0 : -1;
}
/** This group's own radios, not those of a radio group nested inside it. */
function ownRadios(group) {
	return Array.from(group.querySelectorAll("[role=\"radio\"]")).filter((r) => r.closest("[role=\"radiogroup\"]") === group);
}
function isDisabled(el) {
	return el.disabled === true || el.getAttribute("aria-disabled") === "true";
}
// src/components/NewSpecView.tsx
var SPEC_TYPES = [
	{
		id: "feature",
		Icon: Sparkles,
		titleKey: "apps.specBuilder.components.newSpecView.type_feature_title",
		blurbKey: "apps.specBuilder.components.newSpecView.type_feature_blurb"
	},
	{
		id: "bug",
		Icon: Wrench,
		titleKey: "apps.specBuilder.components.newSpecView.type_bug_title",
		blurbKey: "apps.specBuilder.components.newSpecView.type_bug_blurb"
	},
	{
		id: "quick",
		Icon: Zap,
		titleKey: "apps.specBuilder.components.newSpecView.type_quick_title",
		blurbKey: "apps.specBuilder.components.newSpecView.type_quick_blurb"
	}
];
function NewSpecView({ onCancel, onCreated, setErr, onSettings }) {
	const [desc, setDesc] = useState("");
	const [wd, setWd] = useState("");
	const [type, setType] = useState("feature");
	const [busy, setBusy] = useState(false);
	const [useWorktree, setUseWorktree] = useState(false);
	const autoName = slugify(desc);
	const gitQuery = useQuery({
		queryKey: [
			"spec-builder",
			"browse",
			wd
		],
		queryFn: ({ signal }) => specApi.browse(wd, signal),
		enabled: !!wd
	});
	const isGit = !wd || gitQuery.isPending ? null : !!gitQuery.data?.is_git;
	const create = async () => {
		setBusy(true);
		const payload = (n) => ({
			name: n,
			working_dir: wd.trim(),
			spec_type: type,
			description: desc,
			use_worktree: !!(isGit && useWorktree)
		});
		try {
			try {
				await specApi.create(payload(autoName));
				onCreated(autoName);
			} catch (e) {
				if (/already exists/i.test(e.message)) {
					const alt = autoName.slice(0, 44) + "-" + Date.now() % 1e3;
					await specApi.create(payload(alt));
					onCreated(alt);
				} else throw e;
			}
		} catch (e) {
			setErr(e.message);
			setBusy(false);
		}
	};
	const ready = desc.trim().length > 0 && wd.trim().length > 0;
	return /* @__PURE__ */ jsx("div", {
		className: "flex-1 min-h-0 overflow-y-auto",
		children: /* @__PURE__ */ jsxs("div", {
			className: "mx-auto",
			style: {
				maxWidth: "680px",
				padding: "28px 10px 60px"
			},
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "text-[20px] font-semibold mb-1.5",
					children: i18nT("apps.specBuilder.components.newSpecView.let_s_plan_something")
				}),
				/* @__PURE__ */ jsx("div", {
					className: "text-[13px] text-muted mb-7 leading-relaxed",
					children: i18nT("apps.specBuilder.components.newSpecView.tell_me_what_you_have_in_mind_i_ll_ask_a_few_cla")
				}),
				/* @__PURE__ */ jsxs("label", {
					htmlFor: "sb-desc",
					className: "block text-[14px] font-semibold mb-2",
					children: [i18nT("apps.specBuilder.components.newSpecView.what_do_you_want_to_do"), /* @__PURE__ */ jsx("textarea", {
						id: "sb-desc",
						value: desc,
						onChange: (e) => setDesc(e.target.value),
						autoFocus: true,
						rows: 3,
						"aria-label": i18nT("apps.specBuilder.components.newSpecView.describe_what_you_want_to_do"),
						placeholder: i18nT("apps.specBuilder.components.newSpecView.e_g_add_login_with_google_so_users_don_t_need_pa"),
						style: {
							...inputStyle,
							resize: "vertical",
							marginTop: "8px",
							marginBottom: desc.trim() ? "8px" : "24px",
							lineHeight: 1.5,
							fontWeight: 400
						}
					})]
				}),
				desc.trim() ? /* @__PURE__ */ jsx("div", {
					className: "text-[12px] text-muted -mt-1 mb-6 leading-relaxed",
					children: i18nT("apps.specBuilder.components.newSpecView.this_spec_will_be_called", { name: autoName })
				}) : null,
				/* @__PURE__ */ jsx("div", {
					className: "text-[14px] font-semibold mb-2",
					children: i18nT("apps.specBuilder.components.newSpecView.which_project_is_this_for")
				}),
				/* @__PURE__ */ jsx(ProjectPicker, {
					value: wd,
					onChange: setWd
				}),
				!wd && /* @__PURE__ */ jsxs("div", {
					className: "flex gap-2.5 items-center px-3.5 py-2.5 rounded-lg mb-6 -mt-2.5 text-[12px] text-muted leading-relaxed opacity-80",
					style: { border: "1px dashed var(--border)" },
					children: [/* @__PURE__ */ jsx(GitBranch, { className: "lucide-inline text-accent" }), /* @__PURE__ */ jsx("span", { children: i18nT("apps.specBuilder.components.newSpecView.fresh_worktree_option_pick_a_project_folder_abov") })]
				}),
				wd && isGit === false && /* @__PURE__ */ jsxs("div", {
					className: "flex gap-2.5 items-center px-3.5 py-2.5 rounded-lg mb-6 -mt-2.5 text-[12px] text-muted leading-relaxed",
					style: { border: "1px dashed var(--border)" },
					children: [/* @__PURE__ */ jsx(GitBranch, { className: "lucide-inline text-accent" }), /* @__PURE__ */ jsx("span", { children: i18nT("apps.specBuilder.components.newSpecView.this_folder_isn_t_a_git_repository_so_i_ll_work") })]
				}),
				isGit && /* @__PURE__ */ jsxs(Clickable, {
					onClick: () => setUseWorktree(!useWorktree),
					"aria-pressed": useWorktree,
					"aria-label": i18nT("apps.specBuilder.components.newSpecView.work_in_a_fresh_worktree"),
					className: "flex items-start gap-3 px-4 py-3.5 rounded-lg cursor-pointer mb-6 -mt-2.5 focus-ring",
					style: {
						border: "1px solid " + (useWorktree ? "var(--accent)" : "var(--border)"),
						background: useWorktree ? "color-mix(in srgb, var(--accent) 14%, transparent)" : "var(--card)"
					},
					children: [/* @__PURE__ */ jsx("span", {
						"aria-hidden": "true",
						className: "w-4 h-4 rounded inline-flex items-center justify-center shrink-0",
						style: {
							border: "1px solid " + (useWorktree ? "var(--accent)" : "var(--border)"),
							background: useWorktree ? "var(--accent)" : "transparent",
							marginTop: "2px"
						},
						children: useWorktree && /* @__PURE__ */ jsx(Check, { className: "lucide-inline text-accent-fg" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
						className: "text-[13px] font-semibold text-text",
						children: i18nT("apps.specBuilder.components.newSpecView.work_in_a_fresh_worktree")
					}), /* @__PURE__ */ jsx("div", {
						className: "text-[12px] leading-relaxed mt-1 text-muted",
						children: i18nT("apps.specBuilder.components.newSpecView.keeps_your_main_checkout_untouched_branch", { branch: "spec/" + (desc.trim() ? autoName : "…") })
					})] })]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "text-[14px] font-semibold mb-2.5",
					id: "sb-kind-label",
					children: i18nT("apps.specBuilder.components.newSpecView.what_kind_of_work_is_it")
				}),
				/* @__PURE__ */ jsx(RadioChipGroup, {
					className: "flex gap-3 mb-6 flex-wrap",
					ariaLabelledBy: "sb-kind-label",
					children: SPEC_TYPES.map(({ id, Icon, titleKey, blurbKey }) => /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setType(id),
						...radioChip(type === id),
						"aria-label": i18nT(titleKey) + " — " + i18nT(blurbKey),
						className: "px-4 py-3.5 rounded-lg cursor-pointer focus-ring text-left",
						style: {
							flex: "1 1 180px",
							border: "1px solid " + (type === id ? ACCENT : "var(--border)"),
							background: type === id ? SEL_BG : "var(--card)"
						},
						children: [/* @__PURE__ */ jsxs("div", {
							className: "text-[14px] font-semibold mb-1 text-text flex items-center gap-[7px]",
							children: [/* @__PURE__ */ jsx(Icon, { className: "lucide-inline text-accent" }), i18nT(titleKey)]
						}), /* @__PURE__ */ jsx("div", {
							className: "text-[12px] leading-relaxed text-muted",
							children: i18nT(blurbKey)
						})]
					}, id))
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex gap-3 items-center",
					children: [/* @__PURE__ */ jsx(Btn$1, {
						label: busy ? i18nT("apps.specBuilder.components.newSpecView.starting") : i18nT("apps.specBuilder.components.newSpecView.start_the_conversation"),
						primary: true,
						big: true,
						disabled: busy || !ready,
						onClick: create
					}), /* @__PURE__ */ jsx(Btn$1, {
						label: i18nT("apps.specBuilder.components.newSpecView.never_mind"),
						onClick: onCancel
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "text-[12px] text-muted mt-5 leading-relaxed",
					children: [
						i18nT("apps.specBuilder.components.newSpecView.your_plan_is_saved_as_plain_markdown_inside_your"),
						" ",
						/* @__PURE__ */ jsx(Clickable, {
							onClick: onSettings,
							className: "inline underline cursor-pointer focus-ring",
							style: { color: ACCENT },
							children: i18nT("apps.specBuilder.components.newSpecView.settings")
						}),
						"."
					]
				})
			]
		})
	});
}
// src/models.ts
var AUTO_ONLY = [{
	name: "auto",
	description: ""
}];
/**
* The settings model picker's list. The built-in read the dashboard's shared
* `useAvailableModels()` (`GET /api/models`); that path is outside this app's
* API grant, and adoption refuses a widened grant, so the list comes through
* the app's own `GET /models` route, which answers with the host's list for the
* same caller. Until it arrives, or when the host cannot list models, only
* `auto` is known, and the picker offers just "Default (inherit)".
*/
function useAvailableModels() {
	const { data } = useQuery({
		queryKey: ["spec-builder", "available-models"],
		queryFn: async ({ signal }) => {
			const rows = await specApi.models(signal);
			return Array.isArray(rows) ? rows.filter((r) => !!r && typeof r.name === "string") : AUTO_ONLY;
		},
		staleTime: 6e4,
		retry: false
	});
	return data ?? AUTO_ONLY;
}
// src/components/SettingsModal.tsx
function SettingsModal({ onClose }) {
	const [basePath, setBasePath] = useState("");
	const [model, setModel] = useState("");
	const advertised = useAvailableModels().map((m) => m.name).filter((n) => n !== "auto");
	const modelOptions = model && !advertised.includes(model) ? [...advertised, model] : advertised;
	const settingsQuery = useQuery({
		queryKey: ["spec-builder", "settings"],
		queryFn: ({ signal }) => specApi.getSettings(signal)
	});
	useEffect(() => {
		if (settingsQuery.data) {
			setBasePath(settingsQuery.data.base_path || "");
			setModel(settingsQuery.data.model || "");
		}
	}, [settingsQuery.data]);
	const queryClient = useQueryClient();
	const saveMutation = useMutation({
		mutationFn: (next) => specApi.saveSettings(next.base_path, next.model),
		onSuccess: (_data, next) => {
			queryClient.setQueryData(["spec-builder", "settings"], next);
			queryClient.invalidateQueries({ queryKey: ["spec-builder", "settings"] });
			onClose();
		}
	});
	const busy = saveMutation.isPending;
	const unloaded = settingsQuery.isPending || settingsQuery.isError;
	const save = () => saveMutation.mutate({
		base_path: basePath.trim(),
		model
	});
	const failure = settingsQuery.isError ? {
		title: i18nT("apps.specBuilder.components.settingsModal.couldn_t_load_these_settings"),
		message: settingsQuery.error.message
	} : saveMutation.error ? {
		title: i18nT("apps.specBuilder.components.settingsModal.couldn_t_save_these_settings"),
		message: saveMutation.error.message
	} : null;
	return /* @__PURE__ */ jsxs(Modal, {
		open: true,
		onClose,
		dismissDisabled: busy,
		title: i18nT("apps.specBuilder.components.settingsModal.settings"),
		maxWidth: 520,
		footer: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Btn$1, {
			label: i18nT("apps.specBuilder.components.settingsModal.cancel"),
			disabled: busy,
			onClick: onClose
		}), /* @__PURE__ */ jsx(Btn$1, {
			label: busy ? i18nT("apps.specBuilder.components.settingsModal.saving") : i18nT("apps.specBuilder.components.settingsModal.save"),
			primary: true,
			disabled: busy || unloaded,
			onClick: save
		})] }),
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "text-[13px] font-semibold mb-1.5",
				children: i18nT("apps.specBuilder.components.settingsModal.where_should_specs_be_saved")
			}),
			/* @__PURE__ */ jsx("div", {
				id: "sb-base-path-help",
				className: "text-[12px] text-muted mb-2.5 leading-relaxed",
				children: i18nT("apps.specBuilder.components.settingsModal.leave_this_empty_to_keep_specs_inside_each_proje")
			}),
			/* @__PURE__ */ jsx(Input, {
				id: "sb-base-path",
				"aria-describedby": "sb-base-path-help",
				"aria-label": i18nT("apps.specBuilder.components.settingsModal.spec_storage_folder_path"),
				className: "w-full",
				value: basePath,
				onChange: (e) => setBasePath(e.target.value),
				placeholder: i18nT("apps.specBuilder.components.settingsModal.empty_keep_specs_with_each_project_recommended")
			}),
			/* @__PURE__ */ jsx("div", {
				className: "text-[13px] font-semibold mt-4 mb-1.5",
				children: i18nT("apps.specBuilder.components.settingsModal.which_model_should_run_spec_generation")
			}),
			/* @__PURE__ */ jsx("div", {
				className: "text-[12px] text-muted mb-2.5 leading-relaxed",
				children: i18nT("apps.specBuilder.components.settingsModal.default_keeps_the_model_your_chat_agent_resolves")
			}),
			/* @__PURE__ */ jsx(Select, {
				"aria-label": i18nT("apps.specBuilder.components.settingsModal.spec_generation_model"),
				options: modelOptions,
				clearLabel: i18nT("apps.specBuilder.components.settingsModal.model_default_inherit"),
				value: model,
				onChange: setModel
			}),
			/* @__PURE__ */ jsx(ErrorNotice, {
				className: "mt-4",
				title: failure?.title,
				message: failure?.message
			})
		]
	});
}
// src/SpecBuilderPage.tsx
function SpecBuilderInner() {
	const [sel, setSelRaw] = useState(() => {
		try {
			return localStorage.getItem(LS.lastOpen) || null;
		} catch {
			return null;
		}
	});
	const setSel = useCallback((name) => {
		setSelRaw(name);
		try {
			if (name) localStorage.setItem(LS.lastOpen, name);
			else localStorage.removeItem(LS.lastOpen);
		} catch {}
	}, []);
	const [creating, setCreating] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [err, setErr] = useState("");
	const specsQuery = useQuery({
		queryKey: ["spec-builder", "specs"],
		queryFn: ({ signal }) => specApi.list(signal),
		refetchInterval: 15e3
	});
	const specs = useMemo(() => specsQuery.data?.specs ?? [], [specsQuery.data]);
	const loadingSpecs = specsQuery.isPending;
	const queryClient = useQueryClient();
	const loadSpecs = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ["spec-builder", "specs"] });
	}, [queryClient]);
	useEffect(() => {
		if (specsQuery.error) setErr(specsQuery.error.message);
	}, [specsQuery.error]);
	useEffect(() => {
		if (specsQuery.isPending || specsQuery.isFetching || !sel) return;
		if (!specs.some((s) => s.name === sel)) setSelRaw(null);
	}, [
		specsQuery.isFetching,
		specsQuery.isPending,
		specs,
		sel
	]);
	return /* @__PURE__ */ jsxs("div", {
		className: "w-full h-full min-h-0 overflow-hidden box-border flex flex-col text-text bg-bg relative",
		style: creating ? { padding: "18px 22px" } : void 0,
		children: [
			creating && /* @__PURE__ */ jsx("div", {
				className: "flex items-end justify-between gap-4 mb-3.5 shrink-0",
				children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					className: "text-[22px] font-bold tracking-tight text-text-strong",
					children: i18nT("apps.specBuilder.specBuilderPage.spec_builder")
				}), /* @__PURE__ */ jsx("div", {
					className: "text-[13px] text-muted mt-0.5",
					children: i18nT("apps.specBuilder.specBuilderPage.talk_through_an_idea_review_the_plan_then_let_an")
				})] })
			}),
			/* @__PURE__ */ jsx(ErrorNotice, {
				className: "shrink-0 m-2",
				message: err,
				onDismiss: () => setErr(""),
				testId: "spec-builder-error"
			}),
			creating ? /* @__PURE__ */ jsx(NewSpecView, {
				onCancel: () => setCreating(false),
				onCreated: (name) => {
					setCreating(false);
					loadSpecs();
					setSel(name);
				},
				setErr,
				onSettings: () => setShowSettings(true)
			}) : /* @__PURE__ */ jsx(Workspace, {
				specs,
				sel,
				setSel,
				setErr,
				onNew: () => setCreating(true),
				loading: loadingSpecs,
				onSettings: () => setShowSettings(true)
			}),
			showSettings && /* @__PURE__ */ jsx(SettingsModal, { onClose: () => setShowSettings(false) })
		]
	});
}
function SpecBuilderPage() {
	return /* @__PURE__ */ jsx(SpecBuilderInner, {});
}
// src/index.tsx
/**
* The bundle's entry: AppHost lazy-imports this module and renders its default
* export as the app's page.
*
* Two things happen here once, for the whole page. The host's permission-scoped
* API client becomes the transport every Spec Builder call goes through
* (`setTransport`); the embedded chat reads the same client from the host's
* provider, along with the slot-change signal for this app's own slots. And the
* host's language generation is subscribed to, which repaints the page on a
* language switch: `t` reads the active locale at call time, and this
* component's re-render reaches every child.
*/
function SpecBuilderApp() {
	useLanguageGeneration();
	setTransport(useAppApi());
	return /* @__PURE__ */ jsx(SpecBuilderPage, {});
}
export { SpecBuilderApp as default };
