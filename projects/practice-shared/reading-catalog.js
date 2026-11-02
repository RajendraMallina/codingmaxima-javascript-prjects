// Full text is linked from the original public source; the works themselves are not copied here.
const books = [
    ['Pride and Prejudice', 'Jane Austen', '1342'], ["Alice’s Adventures in Wonderland", 'Lewis Carroll', '11'], ['Frankenstein', 'Mary Shelley', '84'],
    ['The Adventures of Sherlock Holmes', 'Arthur Conan Doyle', '1661'], ['Moby Dick; or, The Whale', 'Herman Melville', '2701'], ['A Tale of Two Cities', 'Charles Dickens', '98'],
    ['The Picture of Dorian Gray', 'Oscar Wilde', '174'], ['Dracula', 'Bram Stoker', '345'], ['Metamorphosis', 'Franz Kafka', '5200'],
    ['The Strange Case of Dr. Jekyll and Mr. Hyde', 'Robert Louis Stevenson', '43'], ['Adventures of Huckleberry Finn', 'Mark Twain', '76'], ['The Yellow Wallpaper', 'Charlotte Perkins Gilman', '1952'],
    ['War and Peace', 'Leo Tolstoy', '2600'], ['The Odyssey', 'Homer', '1727'], ['Crime and Punishment', 'Fyodor Dostoyevsky', '2554'],
    ['The Adventures of Tom Sawyer', 'Mark Twain', '74'], ['Great Expectations', 'Charles Dickens', '1400'], ['Jane Eyre', 'Charlotte Brontë', '1260'],
    ['Sense and Sensibility', 'Jane Austen', '161'], ["A Doll's House", 'Henrik Ibsen', '2542'],
];
const papers = [
    ['Attention Is All You Need', 'Ashish Vaswani et al.', '1706.03762'], ['BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding', 'Jacob Devlin et al.', '1810.04805'],
    ['Deep Residual Learning for Image Recognition', 'Kaiming He et al.', '1512.03385'], ['Generative Adversarial Networks', 'Ian J. Goodfellow et al.', '1406.2661'],
    ['Language Models are Few-Shot Learners', 'Tom B. Brown et al.', '2005.14165'], ['An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale', 'Alexey Dosovitskiy et al.', '2010.11929'],
    ['Faster R-CNN: Towards Real-Time Object Detection with Region Proposal Networks', 'Shaoqing Ren et al.', '1506.01497'], ['Auto-Encoding Variational Bayes', 'Diederik P. Kingma and Max Welling', '1312.6114'],
    ['Adam: A Method for Stochastic Optimization', 'Diederik P. Kingma and Jimmy Ba', '1412.6980'], ['RoBERTa: A Robustly Optimized BERT Pretraining Approach', 'Yinhan Liu et al.', '1907.11692'],
    ['Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift', 'Sergey Ioffe and Christian Szegedy', '1502.03167'], ['Deep Networks with Stochastic Depth', 'Gao Huang et al.', '1603.09382'],
    ['U-Net: Convolutional Networks for Biomedical Image Segmentation', 'Olaf Ronneberger, Philipp Fischer and Thomas Brox', '1505.04597'], ['Training language models to follow instructions with human feedback', 'Long Ouyang et al.', '2203.02155'],
    ['LLaMA: Open and Efficient Foundation Language Models', 'Hugo Touvron et al.', '2302.13971'],
    ['Learning Transferable Visual Models From Natural Language Supervision', 'Alec Radford et al.', '2103.00020'], ['LoRA: Low-Rank Adaptation of Large Language Models', 'Edward J. Hu et al.', '2106.09685'],
    ['Denoising Diffusion Probabilistic Models', 'Jonathan Ho et al.', '2006.11239'], ['GPT-4 Technical Report', 'OpenAI', '2303.08774'], ['Layer Normalization', 'Jimmy Lei Ba et al.', '1607.06450'],
];
const articles = [
    ['JavaScript Guide', 'Web/JavaScript/Guide'], ['What is JavaScript?', 'Learn_web_development/Core/Scripting/What_is_JavaScript'],
    ['Functions', 'Web/JavaScript/Guide/Functions'], ['Working with objects', 'Web/JavaScript/Guide/Working_with_objects'],
    ['Using promises', 'Web/JavaScript/Guide/Using_promises'], ['JavaScript modules', 'Web/JavaScript/Guide/Modules'],
    ['Document Object Model (DOM)', 'Web/API/Document_Object_Model'], ['Basic concepts of flexbox', 'Web/CSS/Guides/Flexible_box_layout/Basic_concepts'],
    ['Basic concepts of grid layout', 'Web/CSS/Guides/Grid_layout/Basic_concepts'], ['Your first form', 'Learn_web_development/Extensions/Forms/Your_first_form'],
    ['What is accessibility?', 'Learn_web_development/Core/Accessibility/What_is_accessibility'], ['Array', 'Web/JavaScript/Reference/Global_Objects/Array'],
    ['Closures', 'Web/JavaScript/Guide/Closures'], ['Inheritance and the prototype chain', 'Web/JavaScript/Guide/Inheritance_and_the_prototype_chain'],
    ['What is CSS?', 'Learn_web_development/Core/Styling_basics/What_is_CSS'],
    ['Grammar and types', 'Web/JavaScript/Guide/Grammar_and_types'], ['Control flow and error handling', 'Web/JavaScript/Guide/Control_flow_and_error_handling'],
    ['Indexed collections', 'Web/JavaScript/Guide/Indexed_collections'], ['Expressions and operators', 'Web/JavaScript/Guide/Expressions_and_operators'], ['Regular expressions', 'Web/JavaScript/Guide/Regular_expressions'],
];
export function seedReading() {
    const data = [
        ...books.map(([title, author, id]) => ({ id: 'book-' + id, title, author, type: 'Book', subject: 'Literature', url: `https://www.gutenberg.org/cache/epub/${id}/pg${id}-images.html`, source: 'Project Gutenberg', status: 'Want to read', progress: 0, notes: '' })),
        ...papers.map(([title, author, id]) => ({ id: 'paper-' + id, title, author, type: 'Research paper', subject: 'Machine learning', url: `https://arxiv.org/pdf/${id}`, source: 'arXiv', status: 'Want to read', progress: 0, notes: '' })),
        ...articles.map(([title, path], index) => ({ id: 'article-' + (index + 1), title, author: 'MDN contributors', type: 'Article', subject: 'Web development', url: 'https://developer.mozilla.org/en-US/docs/' + path, source: 'MDN', status: 'Want to read', progress: 0, notes: '' })),
    ];
    data[0] = { ...data[0], status: 'Reading', progress: 35, notes: 'A classic to return to.' };
    data[books.length] = { ...data[books.length], status: 'Reading', progress: 20 };
    data[books.length + papers.length] = { ...data[books.length + papers.length], status: 'Completed', progress: 100 };
    return data;
}
