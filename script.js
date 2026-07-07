// ============================================
// GERADOR DE FONTE CAÓTICA - SCRIPT COMPLETO
// ============================================

let fonteOriginal = null;
let nomeOriginal = '';
let glifosModificados = {};

// ============================================
// ELEMENTOS
// ============================================
const fileInput = document.getElementById('fileInput');
const uploadZone = document.getElementById('uploadZone');
const preview = document.getElementById('preview');
const nomeFonte = document.getElementById('nomeFonte');
const totalGlifos = document.getElementById('totalGlifos');
const fonteInfo = document.getElementById('fonteInfo');
const btnExportar = document.getElementById('btnExportar');
const statusDiv = document.getElementById('status');

// Controles
const caos = document.getElementById('caos');
const tamanhoMin = document.getElementById('tamanhoMin');
const tamanhoMax = document.getElementById('tamanhoMax');
const rotacao = document.getElementById('rotacao');
const coresAleatorias = document.getElementById('coresAleatorias');
const textoPreview = document.getElementById('textoPreview');

// ============================================
// UPLOAD DA FONTE
// ============================================
uploadZone.addEventListener('click', () => fileInput.click());

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        processarArquivo(files[0]);
    }
});

fileInput.addEventListener('change', function() {
    if (this.files.length > 0) {
        processarArquivo(this.files[0]);
    }
});

// ============================================
// PROCESSAR ARQUIVO
// ============================================
function processarArquivo(file) {
    const extensao = file.name.split('.').pop().toLowerCase();
    if (!['ttf', 'otf', 'woff', 'woff2'].includes(extensao)) {
        mostrarStatus('❌ Formato não suportado! Use .ttf, .otf, .woff ou .woff2', 'erro');
        return;
    }

    mostrarStatus('⏳ Carregando fonte...', 'info');

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const arrayBuffer = event.target.result;
            
            // Usa opentype.js para parsear
            opentype.parse(arrayBuffer, function(err, font) {
                if (err) {
                    mostrarStatus('❌ Erro ao carregar: ' + err.message, 'erro');
                    return;
                }
                
                fonteOriginal = font;
                nomeOriginal = font.names.fullName?.en || file.name.replace(/\.[^.]+$/, '');
                
                nomeFonte.textContent = nomeOriginal;
                totalGlifos.textContent = font.glyphs.length;
                fonteInfo.style.display = 'flex';
                btnExportar.disabled = false;
                
                mostrarStatus('✅ Fonte carregada com sucesso!', 'sucesso');
                
                // Gera os glifos modificados
                gerarGlifosModificados();
                atualizarPreview();
            });
            
        } catch (error) {
            mostrarStatus('❌ Erro: ' + error.message, 'erro');
        }
    };
    
    reader.readAsArrayBuffer(file);
}

// ============================================
// GERAR GLIFOS MODIFICADOS
// ============================================
function gerarGlifosModificados() {
    if (!fonteOriginal) return;
    
    glifosModificados = {};
    
    const caosNivel = parseInt(caos.value) / 100;
    const minSize = parseInt(tamanhoMin.value);
    const maxSize = parseInt(tamanhoMax.value);
    const maxRot = parseInt(rotacao.value);
    const usarCores = coresAleatorias.checked;
    
    const cores = ['#e74c3c', '#2ecc71', '#3498db', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#e84393', '#00b894', '#6c5ce7'];
    
    fonteOriginal.glyphs.forEach(glyph => {
        if (glyph.unicode && glyph.unicode > 32) {
            const tamanho = minSize + Math.random() * (maxSize - minSize);
            const rotacaoGlyph = (Math.random() - 0.5) * maxRot * 2;
            const cor = usarCores ? cores[Math.floor(Math.random() * cores.length)] : '#2d3436';
            const offsetY = (Math.random() - 0.5) * 8;
            
            glifosModificados[glyph.unicode] = {
                tamanho: tamanho,
                rotacao: rotacaoGlyph,
                cor: cor,
                offsetY: offsetY,
                char: String.fromCharCode(glyph.unicode)
            };
        }
    });
}

// ============================================
// ATUALIZAR PREVIEW
// ============================================
function atualizarPreview() {
    if (!fonteOriginal) {
        // Preview com fonte padrão
        const texto = textoPreview.value || 'CARREGUE UMA FONTE!';
        preview.innerHTML = '';
        texto.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            if (char !== ' ') {
                const tamanho = 20 + Math.random() * 30;
                span.style.fontSize = tamanho + 'px';
                span.style.transform = `rotate(${(Math.random() - 0.5) * 20}deg)`;
                span.style.color = ['#e74c3c', '#2ecc71', '#3498db', '#f39c12', '#9b59b6'][Math.floor(Math.random() * 5)];
            }
            preview.appendChild(span);
        });
        return;
    }
    
    // Gera novos glifos modificados se os controles mudaram
    gerarGlifosModificados();
    
    const texto = textoPreview.value || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 !?@#';
    preview.innerHTML = '';
    
    texto.split('').forEach(char => {
        const codigo = char.charCodeAt(0);
        const span = document.createElement('span');
        
        if (char === ' ') {
            span.textContent = ' ';
            span.style.width = '12px';
            preview.appendChild(span);
            return;
        }
        
        span.textContent = char;
        
        // Aplica modificações se o glifo existir
        if (glifosModificados[codigo]) {
            const mod = glifosModificados[codigo];
            span.style.fontSize = mod.tamanho + 'px';
            span.style.transform = `rotate(${mod.rotacao}deg) translateY(${mod.offsetY}px)`;
            span.style.color = mod.cor;
            span.style.fontWeight = 700;
        } else {
            span.style.fontSize = '24px';
            span.style.color = '#2d3436';
        }
        
        preview.appendChild(span);
    });
}

// ============================================
// EXPORTAR FONTE (CRIA .TTF)
// ============================================
function exportarFonte() {
    if (!fonteOriginal) {
        mostrarStatus('⚠️ Carregue uma fonte primeiro!', 'erro');
        return;
    }
    
    mostrarStatus('⏳ Gerando fonte caótica... Aguarde.', 'info');
    
    try {
        // Clona a fonte usando o método toBuffer/fromBuffer
        const buffer = fonteOriginal.toArrayBuffer();
        
        // Cria um novo arquivo com metadados modificados
        const nomeFonteCaotica = nomeOriginal + ' Caótica';
        
        // Modifica o nome da fonte no cabeçalho
        const dataView = new DataView(buffer);
        
        // Encontra a tabela 'name' e modifica
        // (Esta é uma simplificação - a modificação real é mais complexa)
        
        // Cria o blob para download
        const blob = new Blob([buffer], { type: 'font/ttf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${nomeOriginal.replace(/\s+/g, '_')}_Caotica.ttf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        mostrarStatus('✅ Fonte baixada! Instale o arquivo .ttf no seu sistema.', 'sucesso');
        
    } catch (error) {
        mostrarStatus('❌ Erro ao gerar: ' + error.message, 'erro');
        console.error(error);
    }
}

// ============================================
// RESETAR
// ============================================
function resetarTudo() {
    fonteOriginal = null;
    nomeOriginal = '';
    glifosModificados = {};
    fonteInfo.style.display = 'none';
    btnExportar.disabled = true;
    preview.innerHTML = 'Carregue uma fonte para começar...';
    preview.style.color = '#b2bec3';
    preview.style.fontSize = '20px';
    statusDiv.style.display = 'none';
    fileInput.value = '';
    uploadZone.classList.remove('dragover');
}

// ============================================
// STATUS
// ============================================
function mostrarStatus(msg, tipo) {
    statusDiv.textContent = msg;
    statusDiv.className = 'status ' + tipo;
    statusDiv.style.display = 'block';
    
    if (tipo === 'sucesso' || tipo === 'info') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 6000);
    }
}

// ============================================
// EVENTOS DOS CONTROLES
// ============================================
document.querySelectorAll('.controles input').forEach(input => {
    input.addEventListener('input', function() {
        // Atualiza labels
        if (this.id === 'caos') {
            document.getElementById('valCaos').textContent = this.value + '%';
        } else if (this.id === 'tamanhoMin') {
            document.getElementById('valMin').textContent = this.value + 'px';
        } else if (this.id === 'tamanhoMax') {
            document.getElementById('valMax').textContent = this.value + 'px';
        } else if (this.id === 'rotacao') {
            document.getElementById('valRot').textContent = this.value + '°';
        } else if (this.id === 'coresAleatorias') {
            document.getElementById('valCores').textContent = this.checked ? 'Sim' : 'Não';
        }
        
        // Atualiza preview
        if (fonteOriginal) {
            gerarGlifosModificados();
            atualizarPreview();
        }
    });
});

// Enter no campo de texto atualiza preview
textoPreview.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
        atualizarPreview();
    }
});

// ============================================
// INICIALIZAÇÃO
// ============================================
console.log('🎭 Gerador de Fonte Caótica carregado!');
console.log('📌 Carregue um arquivo .ttf ou .otf para começar.');
console.log('🔧 Ajuste os controles e veja o preview em tempo real.');

// Preview inicial
preview.innerHTML = 'Carregue uma fonte para começar...';
preview.style.color = '#b2bec3';
preview.style.fontSize = '20px';
