export const studioKeys = { blog: 'codingmaxima.blog-studio.v1', builder: 'codingmaxima.form-builder.v1', reading: 'codingmaxima.reading-library.v1' };
export const types = ['Book', 'Research paper', 'Article'];
export const statuses = ['Want to read', 'Reading', 'Completed'];
export function safeUrl(value) { if (!value.trim())
    return true; try {
    return ['https:', 'http:'].includes(new URL(value).protocol);
}
catch {
    return false;
} }
export function slugFor(title, existing) { const base = title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'post'; let slug = base, n = 2; while (existing.some((post) => post.slug === slug))
    slug = base + '-' + n++; return slug; }
export function seedBlog() {
    return [
        { id: 'blog-1', slug: 'small-projects-big-learning', title: 'Small Projects, Big Learning', category: 'Learning', tags: ['Practice', 'Beginners'], content: 'A small project gives you a clear place to try one new idea. Start with a simple goal, make it work, and then improve one detail at a time.\n\nKeep a note of what surprised you. Those observations often become your next project.', status: 'Published', created: '2026-01-15' },
        { id: 'blog-2', slug: 'building-better-forms', title: 'Building Better Forms', category: 'Web development', tags: ['Forms', 'Accessibility'], content: 'A helpful form makes the next step clear. Start with meaningful labels and group related questions together.\n\nShow feedback close to the field, preserve what the user has entered, and make sure the page works with a keyboard.', status: 'Published', created: '2026-02-10' },
        { id: 'blog-3', slug: 'what-a-table-can-teach', title: 'What a Table Can Teach', category: 'Practice', tags: ['JavaScript', 'Data'], content: 'A table is a useful way to explore how data and a page stay in sync. Try adding a row, editing one value, and updating a summary.\n\nFiltering and sorting can then show different views of the same information.', status: 'Published', created: '2026-03-05' },
        { id: 'blog-4', slug: 'my-next-project-draft', title: 'My Next Project', category: 'Ideas', tags: ['Draft'], content: 'Write down the problem, the smallest useful version, and one feature to add later.', status: 'Draft', created: '2026-03-18' },
    ];
}
export function seedBuilder() {
    return { forms: [{ id: 'sample-feedback', title: 'Workshop feedback', fields: [
                    { id: 'f-name', label: 'Your name', type: 'text', options: [], required: true },
                    { id: 'f-experience', label: 'How was the workshop?', type: 'dropdown', options: ['Excellent', 'Good', 'Needs improvement'], required: true },
                    { id: 'f-return', label: 'Would you attend again?', type: 'radio', options: ['Yes', 'Maybe', 'No'], required: true },
                    { id: 'f-topics', label: 'Topics you enjoyed', type: 'checkbox', options: ['Forms', 'Tables', 'Projects'], required: false },
                ] }], responses: [{ id: 'sample-response', formId: 'sample-feedback', date: '2026-01-15', answers: [{ label: 'Your name', value: 'Alex' }, { label: 'How was the workshop?', value: 'Excellent' }, { label: 'Would you attend again?', value: 'Yes' }, { label: 'Topics you enjoyed', value: 'Forms, Projects' }] }] };
}
const record = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
export const isBlogPost = (v) => record(v) && typeof v['id'] === 'string' && typeof v['slug'] === 'string' && typeof v['title'] === 'string' && typeof v['category'] === 'string' && Array.isArray(v['tags']) && v['tags'].every((t) => typeof t === 'string') && typeof v['content'] === 'string' && (v['status'] === 'Published' || v['status'] === 'Draft') && typeof v['created'] === 'string';
const isField = (v) => record(v) && typeof v['id'] === 'string' && typeof v['label'] === 'string' && ['text', 'dropdown', 'radio', 'checkbox'].includes(String(v['type'])) && Array.isArray(v['options']) && v['options'].every((o) => typeof o === 'string') && typeof v['required'] === 'boolean';
const isForm = (v) => record(v) && typeof v['id'] === 'string' && typeof v['title'] === 'string' && Array.isArray(v['fields']) && v['fields'].every(isField);
const isAnswer = (v) => record(v) && typeof v['label'] === 'string' && typeof v['value'] === 'string';
const isResponse = (v) => record(v) && typeof v['id'] === 'string' && typeof v['formId'] === 'string' && typeof v['date'] === 'string' && Array.isArray(v['answers']) && v['answers'].every(isAnswer);
export const isBuilder = (v) => record(v) && Array.isArray(v['forms']) && v['forms'].every(isForm) && Array.isArray(v['responses']) && v['responses'].every(isResponse);
export const isReading = (v) => record(v) && typeof v['id'] === 'string' && typeof v['title'] === 'string' && typeof v['author'] === 'string' && types.includes(v['type']) && typeof v['subject'] === 'string' && typeof v['url'] === 'string' && safeUrl(v['url']) && typeof v['source'] === 'string' && statuses.includes(v['status']) && typeof v['progress'] === 'number' && Number.isFinite(v['progress']) && v['progress'] >= 0 && v['progress'] <= 100 && typeof v['notes'] === 'string';
