import { WorkflowStep } from './types';

export type WorkflowTemplate = {
  id: string;
  title: string;
  description: string;
  requiredApps: string[];
  steps: Omit<WorkflowStep, 'id'>[];
  category: 'Productivity' | 'AI' | 'Communication' | 'Marketing';
};

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'tpl_gmail_gemini_sheets',
    title: 'AI Email Summarizer',
    description: 'Summarize new emails with Gemini and save to Google Sheets',
    requiredApps: ['gmail', 'gemini', 'google_sheets'],
    category: 'AI',
    steps: [
      {
        type: 'trigger',
        appId: 'gmail',
        eventId: 'new_email',
        config: {}
      },
      {
        type: 'action',
        appId: 'gemini',
        eventId: 'generate_text',
        config: {
          prompt: 'Summarize this email: {{gmail.new_email}}',
          model: 'gemini-3-flash-preview'
        }
      },
      {
        type: 'action',
        appId: 'google_sheets',
        eventId: 'create_row',
        config: {
          spreadsheet_id: 'leads_1',
          values: '{{gemini.generate_text}}'
        }
      }
    ]
  },
  {
    id: 'tpl_veo_social',
    title: 'AI Video Social Post',
    description: 'Generate a video from a prompt and post to TikTok',
    requiredApps: ['veo', 'tiktok'],
    category: 'AI',
    steps: [
      {
        type: 'trigger',
        appId: 'gmail',
        eventId: 'new_email_matching_search',
        config: { q: 'subject:video-idea' }
      },
      {
        type: 'action',
        appId: 'veo',
        eventId: 'generate_video',
        config: {
          prompt: '{{gmail.new_email_matching_search}}',
          aspect_ratio: '9:16'
        }
      },
      {
        type: 'action',
        appId: 'tiktok',
        eventId: 'upload_video',
        config: {
          video_url: '{{veo.generate_video}}'
        }
      }
    ]
  },
  {
    id: 'tpl_search_report',
    title: 'AI Market Research',
    description: 'Search for trends and generate a summary report in Notion',
    requiredApps: ['gemini', 'notion'],
    category: 'AI',
    steps: [
      {
        type: 'trigger',
        appId: 'google_trends',
        eventId: 'trend_spike',
        config: {}
      },
      {
        type: 'action',
        appId: 'gemini',
        eventId: 'search_grounding',
        config: {
          query: 'Latest developments in {{google_trends.trend_spike}}'
        }
      },
      {
        type: 'action',
        appId: 'gemini',
        eventId: 'generate_text',
        config: {
          prompt: 'Write a market research report based on: {{gemini.search_grounding}}',
          model: 'gemini-3.1-pro-preview',
          thinking: true
        }
      },
      {
        type: 'action',
        appId: 'notion',
        eventId: 'create_database_item',
        config: {
          database_id: 'db_2',
          title: 'Research: {{google_trends.trend_spike}}',
          content: '{{gemini.generate_text}}'
        }
      }
    ]
  },
  {
    id: 'tpl_image_gen_store',
    title: 'AI Product Image Gen',
    description: 'Generate product images for new Shopify products',
    requiredApps: ['shopify', 'nano_banana'],
    category: 'AI',
    steps: [
      {
        type: 'trigger',
        appId: 'shopify',
        eventId: 'new_order',
        config: {}
      },
      {
        type: 'action',
        appId: 'nano_banana',
        eventId: 'generate_image',
        config: {
          prompt: 'High quality product photo of {{shopify.new_order}}',
          size: '2K',
          aspect_ratio: '1:1'
        }
      }
    ]
  },
  {
    id: 'tpl_slack_notion',
    title: 'Slack to Notion Task',
    description: 'Create a Notion task from a new Slack message',
    requiredApps: ['slack', 'notion'],
    category: 'Productivity',
    steps: [
      {
        type: 'trigger',
        appId: 'slack',
        eventId: 'new_message',
        config: {}
      },
      {
        type: 'action',
        appId: 'notion',
        eventId: 'create_database_item',
        config: {
          database_id: 'db_1',
          title: '{{slack.new_message}}'
        }
      }
    ]
  },
  {
    id: 'tpl_github_slack',
    title: 'GitHub Issue Notifier',
    description: 'Send a Slack message when a new GitHub issue is created',
    requiredApps: ['github', 'slack'],
    category: 'Communication',
    steps: [
      {
        type: 'trigger',
        appId: 'github',
        eventId: 'new_issue',
        config: {}
      },
      {
        type: 'action',
        appId: 'slack',
        eventId: 'send_channel_message',
        config: {
          channel: 'gen',
          text: 'New GitHub Issue: {{github.new_issue}}'
        }
      }
    ]
  },
  {
    id: 'tpl_gmail_slack',
    title: 'Urgent Email Alert',
    description: 'Forward urgent emails to a Slack channel',
    requiredApps: ['gmail', 'slack'],
    category: 'Communication',
    steps: [
      {
        type: 'trigger',
        appId: 'gmail',
        eventId: 'new_email_matching_search',
        config: { q: 'label:urgent' }
      },
      {
        type: 'action',
        appId: 'slack',
        eventId: 'send_channel_message',
        config: {
          channel: 'alt',
          text: 'Urgent Email: {{gmail.new_email_matching_search}}'
        }
      }
    ]
  }
];
