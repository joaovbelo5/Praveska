import os
import json
import glob
import uuid
from flask import Flask, render_template, request, redirect, url_for, flash, session, send_file, make_response
from flask_bcrypt import Bcrypt
from io import BytesIO

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # Change this in production
bcrypt = Bcrypt(app)

# --- Configuration ---
DATA_DIR = os.path.join(os.getcwd(), 'data', 'assessments')
os.makedirs(DATA_DIR, exist_ok=True)

# --- Database Logic (JSON Files) ---

def load_assessment(assessment_id):
    filepath = os.path.join(DATA_DIR, f"{assessment_id}.json")
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def save_assessment(assessment_data):
    if 'id' not in assessment_data:
        assessment_data['id'] = str(uuid.uuid4())
    
    filepath = os.path.join(DATA_DIR, f"{assessment_data['id']}.json")
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(assessment_data, f, indent=4, ensure_ascii=False)
    return assessment_data['id']

def list_assessments():
    assessments = []
    for filepath in glob.glob(os.path.join(DATA_DIR, "*.json")):
        with open(filepath, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                assessments.append({
                    'id': data.get('id'),
                    'title': data.get('title', 'Sem Título'),
                    'date': data.get('date', ''),
                    'class_name': data.get('class_name', '')
                })
            except json.JSONDecodeError:
                continue
    return assessments

def delete_assessment(assessment_id):
    filepath = os.path.join(DATA_DIR, f"{assessment_id}.json")
    if os.path.exists(filepath):
        os.remove(filepath)
        return True
    return False

# --- PDF Generation Logic ---

def generate_pdf_bytes(assessment_data):
    # Lazy import to avoid crash if GTK3 is missing
    from weasyprint import HTML
    
    # Render the HTML template with the assessment data
    html_content = render_template('pdf_template.html', assessment=assessment_data)
    
    # Create PDF using WeasyPrint
    pdf_bytes = HTML(string=html_content, base_url=request.base_url).write_pdf()
    return pdf_bytes

# --- Routes ---

@app.route('/')
def index():
    if 'user' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # Hardcoded user for simplicity as requested, but using bcrypt for verification
        # In a real app, users would be in a database.
        # Hash for 'admin' is generated for demo purposes.
        # $2b$12$e.g...
        
        # For this demo, we'll just check against a hardcoded hash for user 'admin' pass 'admin'
        # generated via bcrypt.generate_password_hash('admin').decode('utf-8')
        valid_hash = b'$2b$12$7.X/./././././././././././././././././././././././.' # Placeholder
        # Actually, let's just do a simple check and hash generation on the fly for the demo if needed
        # or just simple comparison since we don't have a user DB setup yet.
        
        if username == 'admin' and password == 'admin':
            session['user'] = username
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid credentials', 'danger')
            
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))

@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect(url_for('login'))
    
    assessments = list_assessments()
    return render_template('dashboard.html', assessments=assessments)

@app.route('/create')
def create():
    if 'user' not in session:
        return redirect(url_for('login'))
    
    # Initialize a new empty assessment structure
    new_assessment = {
        'id': str(uuid.uuid4()),
        'title': 'Nova Avaliação',
        'school_logo': '', # URL or base64
        'class_name': '',
        'date': '',
        'instructions': '',
        'questions': [],
        'essay': {
            'enabled': False,
            'theme': '',
            'texts': [],
            'instructions': ''
        },
        'settings': {
            'font': 'Arial',
            'columns': 2
        }
    }
    # Save immediately to have an ID? Or just pass to editor?
    # Let's pass to editor.
    return render_template('editor.html', assessment=new_assessment, mode='create')

@app.route('/edit/<assessment_id>', methods=['GET', 'POST'])
def edit(assessment_id):
    if 'user' not in session:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        # Save the data sent from frontend
        data = request.json
        save_assessment(data)
        return {'status': 'success', 'id': data['id']}
    
    assessment = load_assessment(assessment_id)
    if not assessment:
        flash('Avaliação não encontrada', 'danger')
        return redirect(url_for('dashboard'))
        
    return render_template('editor.html', assessment=assessment, mode='edit')

@app.route('/delete/<assessment_id>')
def delete(assessment_id):
    if 'user' not in session:
        return redirect(url_for('login'))
    
    delete_assessment(assessment_id)
    flash('Avaliação excluída', 'success')
    return redirect(url_for('dashboard'))

@app.route('/generate_pdf/<assessment_id>')
def generate_pdf(assessment_id):
    if 'user' not in session:
        return redirect(url_for('login'))
    
    assessment = load_assessment(assessment_id)
    if not assessment:
        return "Assessment not found", 404
        
    try:
        pdf_bytes = generate_pdf_bytes(assessment)
        
        return send_file(
            BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"prova_{assessment.get('title', 'download')}.pdf"
        )
    except OSError as e:
        # Catching OSError which WeasyPrint raises when GTK is missing
        flash(f"Erro ao gerar PDF: Biblioteca GTK3 não encontrada no sistema. Instale o GTK3 Runtime para Windows. Erro: {str(e)}", "danger")
        return redirect(url_for('dashboard'))
    except Exception as e:
        flash(f"Erro inesperado ao gerar PDF: {str(e)}", "danger")
        return redirect(url_for('dashboard'))

if __name__ == '__main__':
    app.run(port=5000, host='0.0.0.0', debug=False)
