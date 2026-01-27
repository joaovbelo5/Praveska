let questions = [];

document.addEventListener('DOMContentLoaded', function () {
    const initialData = document.getElementById('initialQuestions').value;
    if (initialData) {
        questions = JSON.parse(initialData);
        renderQuestions();
    }

    // Essay toggle listener
    const essayCheck = document.getElementById('essayEnabled');
    const essayFields = document.getElementById('essayFields');
    if (essayCheck) {
        essayCheck.addEventListener('change', function () {
            essayFields.style.display = this.checked ? 'block' : 'none';
        });
    }

    // Logo upload listener
    const logoFile = document.getElementById('examLogoFile');
    if (logoFile) {
        logoFile.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    document.getElementById('examLogo').value = e.target.result;
                    document.getElementById('logoPreview').src = e.target.result;
                    document.getElementById('logoPreviewContainer').style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Initialize Essay Editor if element exists
    const essayEditorEl = document.getElementById('essayTextsEditor');
    if (essayEditorEl) {
        window.essayQuill = new Quill('#essayTextsEditor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    ['image'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }]
                ]
            }
        });
    }

    // Migration for existing questions (string options -> object options)
    if (questions && questions.length > 0) {
        questions.forEach(q => {
            if (q.type === 'multiple_choice' && q.options && q.options.length > 0) {
                if (typeof q.options[0] === 'string') {
                    q.options = q.options.map(opt => ({ text: opt, image: '' }));
                }
            }
        });
        renderQuestions();
    }
});

function addQuestion(type) {
    const newQ = {
        id: Date.now(),
        type: type,
        text: '',
        image: '',
        options: type === 'multiple_choice'
            ? Array(5).fill().map(() => ({ text: '', image: '' }))
            : []
    };
    questions.push(newQ);
    renderQuestions();
}

function removeQuestion(index) {
    if (confirm('Remover esta questão?')) {
        questions.splice(index, 1);
        renderQuestions();
    }
}

function updateQuestion(index, field, value) {
    questions[index][field] = value;
}

function updateOption(qIndex, optIndex, field, value) {
    questions[qIndex].options[optIndex][field] = value;
}

function uploadOptionImage(qIndex, optIndex, file) {
    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload_image', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.url) {
                updateOption(qIndex, optIndex, 'image', data.url);
                renderQuestions(); // Re-render to show image
            } else {
                alert('Erro ao fazer upload da imagem');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Erro ao fazer upload da imagem');
        });
}

function removeOptionImage(qIndex, optIndex) {
    updateOption(qIndex, optIndex, 'image', '');
    renderQuestions();
}

function handleOptionPaste(event, qIndex, optIndex) {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    let blob = null;

    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") === 0) {
            blob = items[i].getAsFile();
            break;
        }
    }

    if (blob) {
        event.preventDefault(); // Prevent pasting the image binary string/filename text if any
        uploadOptionImage(qIndex, optIndex, blob);
    }
}

let quillInstances = {};

function renderQuestions() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    quillInstances = {}; // Reset instances

    questions.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'card question-card mb-4 shadow-sm border-0';

        let typeLabel = '';
        if (q.type === 'multiple_choice') typeLabel = 'Múltipla Escolha';
        else if (q.type === 'true_false') typeLabel = 'Certo/Errado';
        else if (q.type === 'discursive') typeLabel = 'Discursiva';

        let innerHTML = `
            <div class="card-header bg-light d-flex justify-content-between align-items-center border-bottom-0 pt-3 px-4">
                <strong class="text-primary">Questão ${index + 1} - ${typeLabel}</strong>
                <button onclick="removeQuestion(${index})" class="btn btn-sm btn-outline-danger border-0">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="card-body px-4 pb-4">
                <div class="mb-3">
                    <label class="form-label small text-muted text-uppercase fw-bold">Enunciado</label>
                    <div id="editor-${index}" style="height: 150px; background: white;" class="rounded-bottom"></div>
                </div>
                <div class="mb-3">
                    <label class="form-label small text-muted text-uppercase fw-bold">Imagem URL (Opcional)</label>
                    <input type="text" class="form-control bg-light" value="${q.image || ''}" onchange="updateQuestion(${index}, 'image', this.value)" placeholder="https://...">
                </div>
        `;

        if (q.type === 'multiple_choice') {
            innerHTML += `<label class="form-label small text-muted text-uppercase fw-bold mt-2">Alternativas</label>`;
            q.options.forEach((opt, i) => {
                // Handle backward compatibility if render happens before migration (unlikely but safe)
                const text = typeof opt === 'string' ? opt : opt.text;
                const image = typeof opt === 'string' ? '' : opt.image;

                innerHTML += `
                    <div class="mb-3 p-3 bg-light rounded border border-light">
                        <div class="input-group mb-2">
                            <span class="input-group-text bg-white text-muted fw-bold border-end-0">${String.fromCharCode(65 + i)}</span>
                            <input type="text" class="form-control border-start-0 ps-2" value="${text}" onchange="updateOption(${index}, ${i}, 'text', this.value)" onpaste="handleOptionPaste(event, ${index}, ${i})" placeholder="Texto da alternativa">
                            <label class="btn btn-outline-secondary" title="Adicionar Imagem">
                                <i class="fas fa-image"></i>
                                <input type="file" accept="image/*" hidden onchange="uploadOptionImage(${index}, ${i}, this.files[0])">
                            </label>
                        </div>
                        ${image ? `
                            <div class="d-flex align-items-center mt-2">
                                <img src="${image}" class="img-thumbnail me-3" style="height: 60px;">
                                <button class="btn btn-sm btn-outline-danger" onclick="removeOptionImage(${index}, ${i})">
                                    <i class="fas fa-times me-1"></i> Remover Imagem
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
        }

        innerHTML += `</div>`;
        card.innerHTML = innerHTML;
        container.appendChild(card);

        // Initialize Quill
        const quill = new Quill(`#editor-${index}`, {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    ['image'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }]
                ]
            }
        });

        // Set initial content
        quill.root.innerHTML = q.text;

        // Update question text on change
        quill.on('text-change', function () {
            questions[index].text = quill.root.innerHTML;
        });

        quillInstances[index] = quill;
    });
}

function saveAssessment() {
    const data = {
        id: document.getElementById('assessmentId').value,
        title: document.getElementById('examTitle').value,
        class_name: document.getElementById('examClass').value,
        date: document.getElementById('examDate').value,
        school_logo: document.getElementById('examLogo').value,
        instructions: document.getElementById('examInstructions').value,
        settings: {
            font: document.getElementById('examFont').value,
            columns: parseInt(document.getElementById('examColumns').value)
        },
        essay: {
            enabled: document.getElementById('essayEnabled').checked,
            theme: document.getElementById('essayTheme').value,
            // Save as a single HTML string in a list, to maintain compatibility with list structure
            texts: window.essayQuill ? [window.essayQuill.root.innerHTML] : [],
            instructions: document.getElementById('essayInstructions').value
        },
        questions: questions
    };

    fetch(`/edit/${data.id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Avaliação salva com sucesso!');
                window.location.href = '/dashboard';
            } else {
                alert('Erro ao salvar.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Erro ao salvar.');
        });
}
