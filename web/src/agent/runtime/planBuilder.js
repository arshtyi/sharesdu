import { getAgentEnumHints } from '../enumNormalizer';

const enumHints = getAgentEnumHints();

const domainToolAllowlist = Object.freeze({
  course: ['agent_course_search', 'agent_course_context', 'agent_content_search', 'agent_thread_context', 'agent_stats_aggregate', 'search_courses', 'global_search', 'multi_keyword_search', 'get_course_detail', 'get_course_list', 'get_course_post_list', 'get_course_score_list', 'batch_courses_info'],
  article: ['agent_content_search', 'agent_thread_context', 'agent_stats_aggregate', 'search_articles', 'global_search', 'multi_keyword_search', 'get_article_detail', 'get_article_post_list', 'get_article_list', 'get_post_detail', 'batch_articles_info'],
  post: ['agent_content_search', 'agent_thread_context', 'agent_stats_aggregate', 'search_posts', 'search_replies', 'global_search', 'multi_keyword_search', 'get_post_detail', 'get_post_reply_list', 'get_reply_detail', 'batch_posts_info'],
  user: ['agent_content_search', 'agent_thread_context', 'agent_stats_aggregate', 'global_search', 'get_user_homepage', 'get_user_content_preview', 'get_user_content_list'],
  search: ['agent_content_search', 'agent_course_search', 'agent_thread_context', 'agent_stats_aggregate', 'global_search', 'multi_keyword_search', 'search_articles', 'search_posts', 'search_replies', 'search_courses'],
});

const shortText = (value, limit = 160) => {
  const text = String(value || '').trim().replace(/\s+/g, ' ');
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
};

export class AgentPlanBuilder {
  build({ intents = [], domain, userText, history = [], cfg = {} }) {
    const siteDocs = intents.includes('site_docs');
    const siteQuery = intents.includes('site_query');
    const hasOffTopic = intents.includes('off_topic');

    const plan = {
      intent_count: intents.length,
      intents: [...intents],
      domain: domain || 'search',
      objective: hasOffTopic
        ? '判定为站外话题，直接给出简短转介说明'
        : siteDocs && siteQuery
          ? '同时回答站内查询与站点说明'
          : siteDocs
            ? '回答站点说明与政策问题'
            : '回答站内查询问题',
      user_text: shortText(userText, 220),
      context_rounds: Math.max(0, Math.min(6, Math.ceil((history || []).length / 2))),
      tool_priority: [],
      normalization: {},
      fallback: [],
      clarification_risk: 'low',
      allowed_tools: [],
      budgets: {
        max_rounds: cfg.maxRounds,
        max_tool_calls: cfg.maxToolCalls,
        max_total_tokens: cfg.maxTotalTokens,
        max_total_ms: cfg.maxTotalMs,
        max_result_bytes: cfg.maxToolResultBytes,
      },
    };

    if (domain === 'course') {
      plan.tool_priority = ['agent_course_search', 'agent_course_context', 'agent_content_search', 'search_courses'];
      plan.normalization = {
        courseTypes: enumHints.courseTypes,
        courseMethods: enumHints.courseMethods,
        campusList: enumHints.campusList,
        collegeList: enumHints.collegeList,
      };
      plan.fallback = ['agent_content_search', 'search_courses', 'global_search'];
      if (/(哪个|哪门|推荐|给分|好过|难|老师|学分)/.test(userText || '')) {
        plan.clarification_risk = 'medium';
      }
    } else if (domain === 'article') {
      plan.tool_priority = ['agent_content_search', 'search_articles', 'get_article_detail', 'get_article_post_list'];
      plan.fallback = ['global_search', 'search_articles'];
    } else if (domain === 'post') {
      plan.tool_priority = ['agent_content_search', 'search_posts', 'get_post_detail', 'get_post_reply_list'];
      plan.fallback = ['global_search', 'search_posts'];
    } else if (domain === 'user') {
      plan.tool_priority = ['agent_content_search', 'get_user_homepage', 'get_user_content_preview', 'get_user_content_list'];
      plan.fallback = ['global_search'];
    } else {
      plan.tool_priority = ['agent_content_search', 'global_search'];
      plan.fallback = ['search_courses', 'search_articles', 'search_posts', 'global_search'];
    }

    if (siteDocs) {
      plan.doc_focus = ['intro', 'to_know', 'privacy', 'about_us'];
    }

    plan.allowed_tools = [...new Set([
      ...(domainToolAllowlist[plan.domain] || domainToolAllowlist.search),
      ...plan.tool_priority,
      ...plan.fallback,
      ...(siteDocs ? ['get_site_doc', 'get_site_doc_link'] : []),
    ])];

    return plan;
  }

  formatForPrompt(plan) {
    const lines = [
      '【当前检索计划】',
      `- 目标：${plan.objective || '站内查询'}`,
      `- 领域：${plan.domain || 'search'}`,
      `- 优先工具：${(plan.tool_priority || []).join(' -> ') || '默认'}`,
    ];
    if (Array.isArray(plan.doc_focus) && plan.doc_focus.length) {
      lines.push(`- 文档优先：${plan.doc_focus.join(' / ')}`);
    }
    if (plan.normalization && Object.keys(plan.normalization).length) {
      lines.push('- 课程枚举：使用中文值或英文 code 皆可，但最终输出必须标准化。');
    }
    if (Array.isArray(plan.fallback) && plan.fallback.length) {
      lines.push(`- 兜底路径：${plan.fallback.join(' -> ')}`);
    }
    lines.push(`- 澄清风险：${plan.clarification_risk || 'low'}`);
    lines.push(`- 执行预算：最多 ${plan.budgets?.max_rounds || '-'} 轮 / ${plan.budgets?.max_tool_calls || '-'} 次工具 / ${plan.budgets?.max_total_ms || '-'}ms`);
    return lines.join('\n');
  }
}
