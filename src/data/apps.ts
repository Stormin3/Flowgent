export type AppIntegration = {
  id: string;
  name: string;
  category: string;
  color: string;
  iconType: 'lucide' | 'text';
  iconName?: string;
  textIcon?: string;
  triggers: AppEvent[];
  actions: AppEvent[];
};

export type AppField = {
  id: string;
  name: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  required?: boolean;
  options?: { id: string; name: string }[];
  placeholder?: string;
};

export type AppEvent = {
  id: string;
  name: string;
  description: string;
  fields?: AppField[];
  outputFields?: { id: string; name: string; type: string }[];
};

export const APPS: AppIntegration[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'Google Workspace',
    color: '#EA4335',
    iconType: 'lucide',
    iconName: 'Mail',
    triggers: [
      { 
        id: 'new_email', 
        name: 'New Email', 
        description: 'Triggers when a new email arrives.',
        outputFields: [
          { id: 'from', name: 'From Email', type: 'string' },
          { id: 'subject', name: 'Subject', type: 'string' },
          { id: 'body', name: 'Body Text', type: 'string' },
          { id: 'received_at', name: 'Received At', type: 'string' }
        ]
      },
      { 
        id: 'new_email_matching_search', 
        name: 'New Email Matching Search', 
        description: 'Triggers when a new email matches a search query.',
        outputFields: [
          { id: 'from', name: 'From Email', type: 'string' },
          { id: 'subject', name: 'Subject', type: 'string' },
          { id: 'body', name: 'Body Text', type: 'string' }
        ]
      },
    ],
    actions: [
      { 
        id: 'send_email', 
        name: 'Send Email', 
        description: 'Sends a new email.',
        fields: [
          { id: 'to', name: 'To', type: 'string', required: true, placeholder: 'recipient@example.com', description: 'Email address of the recipient' },
          { id: 'subject', name: 'Subject', type: 'string', required: true, placeholder: 'Email subject', description: 'The subject line of the email' },
          { id: 'body', name: 'Body', type: 'string', required: true, placeholder: 'Email content', description: 'The main content of the email' },
        ],
        outputFields: [
          { id: 'message_id', name: 'Message ID', type: 'string' },
          { id: 'thread_id', name: 'Thread ID', type: 'string' }
        ]
      },
      { id: 'create_draft', name: 'Create Draft', description: 'Creates a new email draft.' },
    ],
  },
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    category: 'Google Workspace',
    color: '#0F9D58',
    iconType: 'lucide',
    iconName: 'Table',
    triggers: [
      { id: 'new_row', name: 'New Spreadsheet Row', description: 'Triggers when a new row is added.' },
      { id: 'updated_row', name: 'Updated Spreadsheet Row', description: 'Triggers when a row is updated.' },
    ],
    actions: [
      { 
        id: 'create_row', 
        name: 'Create Spreadsheet Row', 
        description: 'Adds a new row to a spreadsheet.',
        fields: [
          { id: 'spreadsheet_id', name: 'Spreadsheet', type: 'select', required: true, options: [{ id: 'leads_1', name: 'Customer Leads' }, { id: 'inv_1', name: 'Inventory' }], description: 'Select the spreadsheet to add a row to' },
          { id: 'values', name: 'Row Values (Comma separated)', type: 'string', required: true, placeholder: 'Value 1, Value 2, ...', description: 'The values to insert into the new row' },
        ]
      },
      { id: 'update_row', name: 'Update Spreadsheet Row', description: 'Updates an existing row.' },
    ],
  },
  {
    id: 'gemini',
    name: 'Gemini AI',
    category: 'AI',
    color: '#8E24AA',
    iconType: 'lucide',
    iconName: 'Sparkles',
    triggers: [],
    actions: [
      { 
        id: 'generate_text', 
        name: 'Generate Text', 
        description: 'Generates text using a prompt. Supports Flash, Pro, and Flash-Lite.',
        fields: [
          { id: 'prompt', name: 'Prompt', type: 'string', required: true, placeholder: 'Write a summary of...', description: 'The instruction for the AI' },
          { id: 'model', name: 'Model', type: 'select', required: true, options: [
            { id: 'gemini-3.1-flash-lite-preview', name: 'Flash-Lite (Fastest)' },
            { id: 'gemini-3-flash-preview', name: 'Flash (Balanced)' },
            { id: 'gemini-3.1-pro-preview', name: 'Pro (Complex Reasoning)' }
          ], description: 'Choose the model to use' },
          { id: 'thinking', name: 'Thinking Mode', type: 'boolean', description: 'Enable deep thinking for complex tasks (Pro only)' },
          { id: 'google_search', name: 'Google Search Grounding', type: 'boolean', description: 'Enable Google Search to ground the AI response with up-to-date information' }
        ]
      },
      { 
        id: 'search_grounding', 
        name: 'Search Grounding', 
        description: 'Get up-to-date information using Google Search.',
        fields: [
          { id: 'query', name: 'Search Query', type: 'string', required: true, placeholder: 'Latest news on...', description: 'What to search for' }
        ]
      },
      { 
        id: 'maps_grounding', 
        name: 'Maps Grounding', 
        description: 'Get accurate location and place information using Google Maps.',
        fields: [
          { id: 'query', name: 'Location Query', type: 'string', required: true, placeholder: 'Best restaurants in...', description: 'Place or area to search' }
        ]
      },
      { 
        id: 'analyze_media', 
        name: 'Analyze Media', 
        description: 'Analyze images, videos, or audio files.',
        fields: [
          { id: 'media_url', name: 'Media URL', type: 'string', required: true, placeholder: 'https://...', description: 'URL of the file to analyze' },
          { id: 'prompt', name: 'Analysis Prompt', type: 'string', required: true, placeholder: 'Describe this video...', description: 'What to look for in the media' },
          { id: 'google_search', name: 'Google Search Grounding', type: 'boolean', description: 'Enable Google Search to ground the AI analysis with up-to-date information' }
        ]
      },
      { 
        id: 'transcribe_audio', 
        name: 'Transcribe Audio', 
        description: 'Convert speech to text from an audio file.',
        fields: [
          { id: 'audio_url', name: 'Audio URL', type: 'string', required: true, placeholder: 'https://...', description: 'URL of the audio file' }
        ]
      },
      { 
        id: 'generate_speech', 
        name: 'Generate Speech (TTS)', 
        description: 'Convert text to high-quality speech.',
        fields: [
          { id: 'text', name: 'Text to Speak', type: 'string', required: true, placeholder: 'Hello world!', description: 'The content to convert' },
          { id: 'voice', name: 'Voice', type: 'select', options: [
            { id: 'Kore', name: 'Kore (Female)' },
            { id: 'Puck', name: 'Puck (Male)' },
            { id: 'Charon', name: 'Charon (Deep)' }
          ], description: 'Select a voice' }
        ]
      }
    ],
  },
  {
    id: 'veo',
    name: 'Veo Video',
    category: 'AI Video',
    color: '#FF5722',
    iconType: 'lucide',
    iconName: 'Video',
    triggers: [],
    actions: [
      { 
        id: 'generate_video', 
        name: 'Generate Video', 
        description: 'Create cinematic videos from text or images.',
        fields: [
          { id: 'prompt', name: 'Prompt', type: 'string', required: true, placeholder: 'A robot surfing...', description: 'Describe the video' },
          { id: 'aspect_ratio', name: 'Aspect Ratio', type: 'select', options: [
            { id: '16:9', name: 'Landscape (16:9)' },
            { id: '9:16', name: 'Portrait (9:16)' }
          ], description: 'Video dimensions' },
          { id: 'image_url', name: 'Starting Image (Optional)', type: 'string', placeholder: 'https://...', description: 'Use an image as the first frame' }
        ]
      }
    ],
  },
  {
    id: 'nano_banana',
    name: 'Nano Banana Pro',
    category: 'AI Image',
    color: '#FFD600',
    iconType: 'lucide',
    iconName: 'Image',
    triggers: [],
    actions: [
      { 
        id: 'generate_image', 
        name: 'Generate Image', 
        description: 'High-quality image generation with precise controls.',
        fields: [
          { id: 'prompt', name: 'Prompt', type: 'string', required: true, placeholder: 'A futuristic city...', description: 'Describe the image' },
          { id: 'size', name: 'Image Size', type: 'select', options: [
            { id: '1K', name: '1K (Standard)' },
            { id: '2K', name: '2K (High Res)' },
            { id: '4K', name: '4K (Ultra Res)' }
          ], description: 'Resolution' },
          { id: 'aspect_ratio', name: 'Aspect Ratio', type: 'select', options: [
            { id: '1:1', name: 'Square (1:1)' },
            { id: '16:9', name: 'Widescreen (16:9)' },
            { id: '9:16', name: 'Portrait (9:16)' },
            { id: '21:9', name: 'Ultrawide (21:9)' }
          ], description: 'Image dimensions' }
        ]
      }
    ],
  },
  {
    id: 'antigravity',
    name: 'Antigravity',
    category: 'AI Agents',
    color: '#000000',
    iconType: 'lucide',
    iconName: 'Rocket',
    triggers: [
      { id: 'agent_task_completed', name: 'Agent Task Completed', description: 'Triggers when an agent finishes a task.' },
    ],
    actions: [
      { 
        id: 'run_agent', 
        name: 'Run Agent', 
        description: 'Triggers an agent to perform a task.',
        fields: [
          { id: 'task', name: 'Task Description', type: 'string', required: true, placeholder: 'Research the latest...', description: 'What should the agent do?' },
        ]
      },
    ],
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Productivity',
    color: '#000000',
    iconType: 'lucide',
    iconName: 'FileText',
    triggers: [
      { id: 'new_database_item', name: 'New Database Item', description: 'Triggers when a new item is added to a database.' },
    ],
    actions: [
      { 
        id: 'create_database_item', 
        name: 'Create Database Item', 
        description: 'Creates a new item in a database.',
        fields: [
          { id: 'database_id', name: 'Database', type: 'select', required: true, options: [{ id: 'db_1', name: 'Tasks' }, { id: 'db_2', name: 'Notes' }], description: 'Select the Notion database' },
          { id: 'title', name: 'Item Title', type: 'string', required: true, placeholder: 'New task name', description: 'The title of the new database item' },
        ]
      },
      { id: 'update_page', name: 'Update Page', description: 'Updates an existing page.' },
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    color: '#4A154B',
    iconType: 'lucide',
    iconName: 'MessageSquare',
    triggers: [
      { id: 'new_message', name: 'New Message', description: 'Triggers when a new message is posted.' },
    ],
    actions: [
      { 
        id: 'send_channel_message', 
        name: 'Send Channel Message', 
        description: 'Sends a message to a channel.',
        fields: [
          { id: 'channel', name: 'Channel', type: 'select', required: true, options: [{ id: 'gen', name: '#general' }, { id: 'alt', name: '#alerts' }], description: 'The Slack channel to send the message to' },
          { id: 'text', name: 'Message Text', type: 'string', required: true, placeholder: 'Hello world!', description: 'The content of the message' },
        ]
      },
      { id: 'send_direct_message', name: 'Send Direct Message', description: 'Sends a direct message to a user.' },
    ],
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'Communication',
    color: '#5865F2',
    iconType: 'lucide',
    iconName: 'MessageCircle',
    triggers: [
      { 
        id: 'new_message_in_channel', 
        name: 'New Message', 
        description: 'Triggers when a new message is posted in a channel.',
        outputFields: [
          { id: 'message_id', name: 'Message ID', type: 'string' },
          { id: 'content', name: 'Content', type: 'string' },
          { id: 'author_id', name: 'Author ID', type: 'string' },
          { id: 'author_name', name: 'Author Name', type: 'string' },
          { id: 'channel_id', name: 'Channel ID', type: 'string' }
        ]
      },
      { 
        id: 'new_member', 
        name: 'New Member', 
        description: 'Triggers when a new user joins the server.',
        outputFields: [
          { id: 'user_id', name: 'User ID', type: 'string' },
          { id: 'username', name: 'Username', type: 'string' },
          { id: 'joined_at', name: 'Joined At', type: 'string' }
        ]
      },
    ],
    actions: [
      { 
        id: 'send_channel_message', 
        name: 'Send Channel Message', 
        description: 'Sends a message to a specific channel.',
        fields: [
          { id: 'channel_id', name: 'Channel ID', type: 'string', required: true, placeholder: '123456789012345678', description: 'The ID of the Discord channel' },
          { id: 'content', name: 'Message Content', type: 'string', required: true, placeholder: 'Hello everyone!', description: 'The content of the message to send' },
        ],
        outputFields: [
          { id: 'message_id', name: 'Message ID', type: 'string' },
          { id: 'timestamp', name: 'Timestamp', type: 'string' }
        ]
      },
      { 
        id: 'add_role', 
        name: 'Add Role to Member', 
        description: 'Assigns a role to a server member.',
        fields: [
          { id: 'user_id', name: 'User ID', type: 'string', required: true, placeholder: '123456789012345678', description: 'The ID of the user' },
          { id: 'role_id', name: 'Role ID', type: 'string', required: true, placeholder: '987654321098765432', description: 'The ID of the role to assign' }
        ]
      },
    ],
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'Development',
    color: '#181717',
    iconType: 'lucide',
    iconName: 'Github',
    triggers: [
      { id: 'new_issue', name: 'New Issue', description: 'Triggers when a new issue is created.' },
      { id: 'new_pr', name: 'New Pull Request', description: 'Triggers when a new PR is opened.' },
      { id: 'push', name: 'New Push', description: 'Triggers when code is pushed to a repository.' },
    ],
    actions: [
      { 
        id: 'create_issue', 
        name: 'Create Issue', 
        description: 'Creates a new issue.',
        fields: [
          { id: 'repo', name: 'Repository', type: 'select', required: true, options: [{ id: 'repo_1', name: 'frontend-app' }, { id: 'repo_2', name: 'backend-api' }], description: 'Select the repository' },
          { id: 'title', name: 'Issue Title', type: 'string', required: true, placeholder: 'Bug: ...', description: 'The title of the issue' },
          { id: 'body', name: 'Issue Body', type: 'string', placeholder: 'Steps to reproduce...', description: 'Detailed description of the issue' },
        ]
      },
      { id: 'create_pr', name: 'Create Pull Request', description: 'Creates a new pull request.' },
    ],
  },
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'E-commerce',
    color: '#96BF48',
    iconType: 'lucide',
    iconName: 'ShoppingBag',
    triggers: [
      { id: 'new_order', name: 'New Order', description: 'Triggers when a new order is placed.' },
      { id: 'new_customer', name: 'New Customer', description: 'Triggers when a new customer registers.' },
    ],
    actions: [
      { id: 'create_product', name: 'Create Product', description: 'Creates a new product.' },
      { id: 'update_inventory', name: 'Update Inventory', description: 'Updates inventory levels.' },
    ],
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'CRM',
    color: '#FF7A59',
    iconType: 'lucide',
    iconName: 'Users',
    triggers: [
      { id: 'new_contact', name: 'New Contact', description: 'Triggers when a new contact is created.' },
      { id: 'new_deal', name: 'New Deal', description: 'Triggers when a new deal is created.' },
    ],
    actions: [
      { id: 'create_contact', name: 'Create Contact', description: 'Creates a new contact.' },
      { id: 'create_deal', name: 'Create Deal', description: 'Creates a new deal.' },
    ],
  },
  {
    id: 'claude',
    name: 'Claude',
    category: 'AI',
    color: '#D97757',
    iconType: 'text',
    textIcon: 'C',
    triggers: [],
    actions: [
      { id: 'generate_text', name: 'Generate Text', description: 'Generates text using Claude.' },
    ],
  },
  {
    id: 'google_drive',
    name: 'Google Drive',
    category: 'Google Workspace',
    color: '#4285F4',
    iconType: 'lucide',
    iconName: 'HardDrive',
    triggers: [
      { id: 'new_file', name: 'New File in Folder', description: 'Triggers when a new file is added.' },
    ],
    actions: [
      { id: 'upload_file', name: 'Upload File', description: 'Uploads a file to Google Drive.' },
      { id: 'create_folder', name: 'Create Folder', description: 'Creates a new folder.' },
    ],
  },
  {
    id: 'google_keep',
    name: 'Google Keep',
    category: 'Google Workspace',
    color: '#FBBC04',
    iconType: 'lucide',
    iconName: 'StickyNote',
    triggers: [
      { id: 'new_note', name: 'New Note', description: 'Triggers when a new note is created.' },
    ],
    actions: [
      { id: 'create_note', name: 'Create Note', description: 'Creates a new note.' },
    ],
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'Database',
    color: '#336791',
    iconType: 'lucide',
    iconName: 'Database',
    triggers: [
      { id: 'new_row', name: 'New Row', description: 'Triggers when a new row is inserted.' },
    ],
    actions: [
      { id: 'insert_row', name: 'Insert Row', description: 'Inserts a new row into a table.' },
      { id: 'run_query', name: 'Run Custom Query', description: 'Executes a custom SQL query.' },
    ],
  },
  {
    id: 'railway',
    name: 'Railway',
    category: 'Development',
    color: '#0B0D0E',
    iconType: 'lucide',
    iconName: 'Train',
    triggers: [
      { id: 'deploy_success', name: 'Deployment Success', description: 'Triggers when a deployment succeeds.' },
    ],
    actions: [
      { id: 'trigger_deploy', name: 'Trigger Deployment', description: 'Triggers a new deployment.' },
    ],
  },
  {
    id: 'make',
    name: 'Make',
    category: 'Automation',
    color: '#1A0041',
    iconType: 'lucide',
    iconName: 'Workflow',
    triggers: [
      { id: 'webhook', name: 'Catch Webhook', description: 'Triggers when a webhook is received.' },
    ],
    actions: [
      { id: 'call_scenario', name: 'Call Scenario', description: 'Triggers a Make scenario.' },
    ],
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'Automation',
    color: '#FF4A00',
    iconType: 'lucide',
    iconName: 'Zap',
    triggers: [
      { id: 'catch_hook', name: 'Catch Hook', description: 'Triggers when a webhook is received.' },
    ],
    actions: [
      { id: 'trigger_zap', name: 'Trigger Zap', description: 'Triggers a Zapier Zap.' },
    ],
  },
  {
    id: 'ifttt',
    name: 'IFTTT',
    category: 'Automation',
    color: '#000000',
    iconType: 'text',
    textIcon: 'IF',
    triggers: [
      { id: 'applet_run', name: 'Applet Run', description: 'Triggers when an applet runs.' },
    ],
    actions: [
      { id: 'trigger_applet', name: 'Trigger Applet', description: 'Triggers an IFTTT applet.' },
    ],
  },
  {
    id: 'google_maps',
    name: 'Google Maps',
    category: 'Location',
    color: '#4285F4',
    iconType: 'lucide',
    iconName: 'Map',
    triggers: [],
    actions: [
      { id: 'get_directions', name: 'Get Directions', description: 'Gets directions between two points.' },
      { id: 'geocode', name: 'Geocode Address', description: 'Converts an address to coordinates.' },
    ],
  },
  {
    id: 'google_trends',
    name: 'Google Trends',
    category: 'Analytics',
    color: '#4285F4',
    iconType: 'lucide',
    iconName: 'TrendingUp',
    triggers: [
      { id: 'trend_spike', name: 'Trend Spike', description: 'Triggers when a keyword spikes in popularity.' },
    ],
    actions: [
      { id: 'get_interest', name: 'Get Interest Over Time', description: 'Gets interest data for a keyword.' },
    ],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    category: 'Social Media',
    color: '#1877F2',
    iconType: 'lucide',
    iconName: 'Facebook',
    triggers: [
      { id: 'new_post', name: 'New Post to Page', description: 'Triggers when a new post is added to a page.' },
    ],
    actions: [
      { id: 'create_page_post', name: 'Create Page Post', description: 'Creates a new post on a page.' },
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'Social Media',
    color: '#E4405F',
    iconType: 'lucide',
    iconName: 'Instagram',
    triggers: [
      { id: 'new_media', name: 'New Media Posted', description: 'Triggers when new media is posted.' },
    ],
    actions: [
      { id: 'publish_photo', name: 'Publish Photo', description: 'Publishes a photo to an account.' },
    ],
  },
  {
    id: 'threads',
    name: 'Threads',
    category: 'Social Media',
    color: '#000000',
    iconType: 'text',
    textIcon: '@',
    triggers: [
      { id: 'new_thread', name: 'New Thread', description: 'Triggers when a new thread is posted.' },
    ],
    actions: [
      { id: 'create_thread', name: 'Create Thread', description: 'Creates a new thread.' },
    ],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    category: 'Social Media',
    color: '#000000',
    iconType: 'lucide',
    iconName: 'Video',
    triggers: [
      { id: 'new_video', name: 'New Video Posted', description: 'Triggers when a new video is posted.' },
    ],
    actions: [
      { id: 'upload_video', name: 'Upload Video', description: 'Uploads a video to an account.' },
    ],
  },
  {
    id: 'tiktok_shop',
    name: 'TikTok Shop',
    category: 'E-commerce',
    color: '#000000',
    iconType: 'lucide',
    iconName: 'ShoppingBag',
    triggers: [
      { id: 'new_order', name: 'New Order', description: 'Triggers when a new order is placed.' },
    ],
    actions: [
      { id: 'update_inventory', name: 'Update Inventory', description: 'Updates inventory levels.' },
    ],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'Social Media',
    color: '#FF0000',
    iconType: 'lucide',
    iconName: 'Youtube',
    triggers: [
      { id: 'new_video', name: 'New Video in Channel', description: 'Triggers when a new video is uploaded.' },
      { id: 'new_comment', name: 'New Comment', description: 'Triggers when a new comment is posted.' },
    ],
    actions: [
      { id: 'upload_video', name: 'Upload Video', description: 'Uploads a video to a channel.' },
    ],
  },
  {
    id: 'medium',
    name: 'Medium',
    category: 'Publishing',
    color: '#000000',
    iconType: 'text',
    textIcon: 'M',
    triggers: [
      { id: 'new_story', name: 'New Story Published', description: 'Triggers when a new story is published.' },
    ],
    actions: [
      { id: 'create_story', name: 'Create Story', description: 'Creates a new story.' },
    ],
  },
  {
    id: 'blogger',
    name: 'Blogger',
    category: 'Publishing',
    color: '#F57C00',
    iconType: 'text',
    textIcon: 'B',
    triggers: [
      { id: 'new_post', name: 'New Post', description: 'Triggers when a new post is published.' },
    ],
    actions: [
      { id: 'create_post', name: 'Create Post', description: 'Creates a new post.' },
    ],
  },
  {
    id: 'substack',
    name: 'Substack',
    category: 'Publishing',
    color: '#FF6719',
    iconType: 'text',
    textIcon: 'S',
    triggers: [
      { id: 'new_subscriber', name: 'New Subscriber', description: 'Triggers when a new subscriber joins.' },
      { id: 'new_post', name: 'New Post', description: 'Triggers when a new post is published.' },
    ],
    actions: [
      { id: 'create_draft', name: 'Create Draft', description: 'Creates a new draft post.' },
    ],
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'Marketing',
    color: '#FFE01B',
    iconType: 'lucide',
    iconName: 'Mail',
    triggers: [
      { id: 'new_subscriber', name: 'New Subscriber', description: 'Triggers when a new subscriber joins an audience.' },
    ],
    actions: [
      { id: 'add_subscriber', name: 'Add/Update Subscriber', description: 'Adds or updates a subscriber.' },
      { id: 'send_campaign', name: 'Send Campaign', description: 'Sends an email campaign.' },
    ],
  },
  {
    id: 'linktree',
    name: 'Linktree',
    category: 'Marketing',
    color: '#43E660',
    iconType: 'lucide',
    iconName: 'Link',
    triggers: [],
    actions: [
      { id: 'add_link', name: 'Add Link', description: 'Adds a new link to your profile.' },
    ],
  },
  {
    id: 'airtable',
    name: 'Airtable',
    category: 'Database',
    color: '#18BFFF',
    iconType: 'lucide',
    iconName: 'Table',
    triggers: [
      { id: 'new_record', name: 'New Record', description: 'Triggers when a new record is created.' },
    ],
    actions: [
      { id: 'create_record', name: 'Create Record', description: 'Creates a new record.' },
      { id: 'update_record', name: 'Update Record', description: 'Updates an existing record.' },
    ],
  },
  {
    id: 'etsy',
    name: 'Etsy',
    category: 'E-commerce',
    color: '#F1641E',
    iconType: 'lucide',
    iconName: 'ShoppingBag',
    triggers: [
      { id: 'new_order', name: 'New Order', description: 'Triggers when a new order is placed.' },
    ],
    actions: [
      { id: 'update_inventory', name: 'Update Inventory', description: 'Updates inventory for a listing.' },
    ],
  },
  {
    id: 'amazon',
    name: 'Amazon Seller Central',
    category: 'E-commerce',
    color: '#FF9900',
    iconType: 'lucide',
    iconName: 'ShoppingCart',
    triggers: [
      { id: 'new_order', name: 'New Order', description: 'Triggers when a new order is placed.' },
    ],
    actions: [
      { id: 'update_price', name: 'Update Price', description: 'Updates the price of a product.' },
    ],
  },
  {
    id: 'ebay',
    name: 'eBay',
    category: 'E-commerce',
    color: '#E53238',
    iconType: 'lucide',
    iconName: 'ShoppingCart',
    triggers: [
      { id: 'new_order', name: 'New Order', description: 'Triggers when an item is sold.' },
    ],
    actions: [
      { id: 'create_listing', name: 'Create Listing', description: 'Creates a new item listing.' },
    ],
  },
  {
    id: 'redbutton',
    name: 'Redbutton',
    category: 'Hardware',
    color: '#FF0000',
    iconType: 'lucide',
    iconName: 'CircleDot',
    triggers: [
      { id: 'button_pressed', name: 'Button Pressed', description: 'Triggers when the physical button is pressed.' },
    ],
    actions: [],
  },
  {
    id: 'wordpress',
    name: 'WordPress',
    category: 'Publishing',
    color: '#21759B',
    iconType: 'text',
    textIcon: 'W',
    triggers: [
      { id: 'new_post', name: 'New Post', description: 'Triggers when a new post is published.' },
      { id: 'new_comment', name: 'New Comment', description: 'Triggers when a new comment is posted.' },
    ],
    actions: [
      { id: 'create_post', name: 'Create Post', description: 'Creates a new post.' },
    ],
  },
  {
    id: 'wix',
    name: 'Wix',
    category: 'Website',
    color: '#000000',
    iconType: 'text',
    textIcon: 'W',
    triggers: [
      { id: 'new_form_submission', name: 'New Form Submission', description: 'Triggers when a form is submitted.' },
    ],
    actions: [
      { id: 'add_contact', name: 'Add Contact', description: 'Adds a new contact.' },
    ],
  },
];

export const APPS_BY_ID = APPS.reduce((acc, app) => {
  acc[app.id] = app;
  return acc;
}, {} as Record<string, AppIntegration>);
