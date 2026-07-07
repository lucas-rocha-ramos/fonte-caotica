// ============================================
// GERADOR DE FONTE CAÓTICA - VERSÃO DEBUG
// ============================================

console.log('🎭 Gerador de Fonte Caótica - Iniciado!');

let fonteCarregada = null;
let nomeFonte = '';
let dadosFonte = null;
let glifosModificados = {};

// ============================================
// ELEMENTOS
// ============================================
const fileInput = document.getElementById('fileInput');
const uploadZone = document.getElementById('uploadZone');
const btnUpload = document.getElementById('btnUpload');
const statusDiv = document.getElementById('status');
const fonteInfo = document.getElementById('fonteInfo');
const nomeFonteSpan = document.getElementById('nomeFonte');
const totalGlifosSpan = document.getElementById('totalGlifos');
const tamanhoArquivoSpan = document.getElementById('tamanhoArquivo');
const preview = document.getElementById('preview');
const btnExportar = document.getElementById('btnExportar');
const textoPreview = document.getElementById('textoPreview');

// ============================================
// VERIFICA SE OPENTYPE ESTÁ CARREGADO
// ============================================
console.log('🔍 Verificando opentype...');
console.log('📦 opentype disponível?', typeof opentype !== 'undefined');

if (typeof opentype === 'undefined') {
    console.error('❌ opentype NÃO está carregado!');
    mostrarStatus('❌ Biblioteca opentype.js não carregada!', 'erro');
} else {
    console.log('✅ opentype carregado! Versão:', opentype.version || 'desconhecida');
}

// ============================================
// EVENTO DE UPLOAD
// ============================================
btnUpload.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('🖱️ Botão upload clicado');
    fileInput.click();
});

uploadZone.addEventListener('click', function(e) {
    if (e.target === btnUpload || e.target.closest('.btn')) return;
    console.log('🖱️ Área upload clicada');
    fileInput.click();
});

fileInput.addEventListener('change', function(e) {
    console.log('📁 Arquivo selecionado:', this.files[0]?.name);
    
    if (this.files.length === 0) {
        mostrarStatus('⚠️ Nenhum arquivo selecionado', 'erro');
        return;
    }
    
    const file = this.files[0];
    processarArquivo(file);
});

// ============================================
// PROCESSAR ARQUIVO - COM DEBUG
// ============================================
function processarArquivo(file) {
    console.log('📂 Processando:', file.name, file.size, 'bytes');
    
    // Verifica extensão
    const extensao = file.name.split('.').pop().toLowerCase();
    console.log('📄 Extensão:', extensao);
    
    if (!['ttf', 'otf', 'woff', 'woff2'].includes(extensao)) {
        mostrarStatus(`❌ Formato "${extensao}" não suportado! Use .ttf, .otf, .woff ou .woff2`, 'erro');
        return;
    }
    
    mostrarStatus('⏳ Carregando fonte...', 'info');
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const arrayBuffer = event.target.result;
            console.log('✅ Arquivo lido, tamanho:', arrayBuffer.byteLength);
            
            // Verifica se opentype está disponível
            if (typeof opentype === 'undefined') {
                console.error('❌ opentype não definido!');
                mostrarStatus('❌ Biblioteca opentype.js não carregada!', 'erro');
                return;
            }
            
            console.log('🔄 Chamando opentype.parse...');
            
            // ============================================
            // MÉTODO CORRETO PARA OPENTYPE.JS
            // ============================================
            try {
                // Tenta parsear usando a função correta
                const font = opentype.parse(arrayBuffer);
                console.log('✅ Fonte parseada com sucesso (método síncrono)!');
                onFontLoaded(font, file);
            } catch (parseError) {
                console.error('❌ Erro no parse síncrono:', parseError);
                
                // Tenta o método assíncrono como fallback
                console.log('🔄 Tentando método assíncrono...');
                opentype.parse(arrayBuffer, function(err, font) {
                    if (err) {
                        console.error('❌ Erro no parse assíncrono:', err);
                        mostrarStatus('❌ Erro ao processar fonte: ' + err.message, 'erro');
                        return;
                    }
                    console.log('✅ Fonte parseada com sucesso (método assíncrono)!');
                    onFontLoaded(font, file);
                });
            }
            
        } catch (error) {
            console.error('❌ Erro geral:', error);
            mostrarStatus('❌ Erro: ' + error.message, 'erro');
        }
    };
    
    reader.onerror = function() {
        console.error('❌ Erro ao ler o arquivo');
        mostrarStatus('❌ Erro ao ler o arquivo', 'erro');
    };
    
    reader.readAsArrayBuffer(file);
}

// ============================================
// FUNÇÃO CHAMADA QUANDO FONTE É CARREGADA
// ============================================
function onFontLoaded(font, file) {
    console.log('🎯 onFontLoaded chamado!');
    console.log('📊 Nome da fonte:', font.names?.fullName?.en || 'desconhecido');
    console.log('📊 Glifos:', font.glyphs?.length || 0);
    
    if (!font.glyphs || font.glyphs.length === 0) {
        mostrarStatus('❌ Fonte não tem glifos!', 'erro');
        return;
    }
    
    fonteCarregada = font;
    nomeFonte = font.names?.fullName?.en || file.name.replace(/\.[^.]+$/, '');
    dadosFonte = file; // Guarda o arquivo original
    
    // Atualiza informações
    nomeFonteSpan.textContent = nomeFonte;
    totalGlifosSpan.textContent = font.glyphs.length;
    tamanhoArquivoSpan.textContent = (file.size / 1024).toFixed(1) + ' KB';
    fonteInfo.style.display = 'flex';
    btnExportar.disabled = false;
    
    mostrarStatus('✅ Fonte carregada com sucesso!', 'sucesso');
    console.log('🎉 Fonte carregada!');
    
    // Gera preview
    gerarGlifosModificados();
    atualizarPreview();
}

// ============================================
// GERAR GLIFOS MODIFICADOS
// ============================================
function gerarGlifosModificados() {
    if (!fonteCarregada) {
        console.warn('⚠️ Tentando gerar glifos sem fonte');
        return;
    }
    
    console.log('🔄 Gerando glifos modificados...');
    glifosModificados = {};
    
    const caosNivel = parseInt(document.getElementById('caos').value) / 100;
    const minSize = parseInt(document.getElementById('tamanhoMin').value);
    const maxSize = parseInt(document.getElementById('tamanhoMax').value);
    const maxRot = parseInt(document.getElementById('rotacao').value);
    const usarCores = document.getElementById('coresAleatorias').checked;
    
    const cores = ['#e74c3c', '#2ecc71', '#3498db', '#f39c12', '#9b59b6', 
                   '#1abc9c', '#e67e22', '#e84393', '#00b894', '#6c5ce7'];
    
    let contador = 0;
    
    // Pega todos os glifos com unicode
    fonteCarregada.glyphs.forEach(function(glyph, index) {
        if (glyph.unicode && glyph.unicode > 32) {
            // Tamanho aleatório
            const tamanho = minSize + Math.random() * (maxSize - minSize);
            
            // Rotação aleatória
            const rotacao = (Math.random() - 0.5) * maxRot * 2;
            
            // Cor aleatória
            const cor = usarCores ? cores[Math.floor(Math.random() * cores.length)] : '#2d3436';
            
            // Deslocamento vertical
            const offsetY = (Math.random() - 0.5) * 12;
            
            glifosModificados[glyph.unicode] = {
                tamanho: tamanho,
                rotacao: rotacao,
                cor: cor,
                offsetY: offsetY,
                char: String.fromCharCode(glyph.unicode)
            };
            contador++;
        }
    });
    
    console.log(`✅ ${contador} glifos modificados!`);
}

// ============================================
// ATUALIZAR PREVIEW
// ============================================
function atualizarPreview() {
    const texto = textoPreview.value || 'FONTE CAÓTICA!';
    preview.innerHTML = '';
    
    if (!fonteCarregada) {
        console.warn('⚠️ Preview sem fonte carregada');
        // Preview simples sem fonte
        texto.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            if (char !== ' ') {
                span.style.fontSize = (20 + Math.random() * 30) + 'px';
                span.style.transform = `rotate(${(Math.random() - 0.5) * 20}deg)`;
                span.style.color = ['#e74c3c', '#2ecc71', '#3498db', '#f39c12', '#9b59b6'][Math.floor(Math.random() * 5)];
            }
            preview.appendChild(span);
        });
        return;
    }
    
    // Gera novos glifos se não existirem
    if (Object.keys(glifosModificados).length === 0) {
        gerarGlifosModificados();
    }
    
    texto.split('').forEach(char => {
        const codigo = char.charCodeAt(0);
        const span = document.createElement('span');
        
        if (char === ' ') {
            span.textContent = ' ';
            span.style.width = '15px';
            preview.appendChild(span);
            return;
        }
        
        span.textContent = char;
        
        if (glifosModificados[codigo]) {
            const mod = glifosModificados[codigo];
            span.style.fontSize = mod.tamanho + 'px';
            span.style.transform = `rotate(${mod.rotacao}deg) translateY(${mod.offsetY}px)`;
            span.style.color = mod.cor;
            span.style.fontWeight = 'bold';
        } else {
            span.style.fontSize = '24px';
            span.style.color = '#2d3436';
        }
        
        preview.appendChild(span);
    });
}

// ============================================
// EXPORTAR FONTE
// ============================================
function exportarFonte() {
    if (!fonteCarregada) {
        mostrarStatus('⚠️ Carregue uma fonte primeiro!', 'erro');
        return;
    }
    
    mostrarStatus('⏳ Gerando arquivo...', 'info');
    
    try {
        // Usa o arrayBuffer original
        if (!dadosFonte) {
            mostrarStatus('❌ Dados da fonte não disponíveis', 'erro');
            return;
        }
        
        // Lê o arquivo novamente
        const reader = new FileReader();
        reader.onload = function(event) {
            const buffer = event.target.result;
            const blob = new Blob([buffer], { type: 'font/ttf' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `${nomeFonte.replace(/\s+/g, '_')}_Caotica.ttf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => URL.revokeObjectURL(url), 10000);
            mostrarStatus('✅ Fonte baixada!', 'sucesso');
        };
        reader.onerror = function() {
            mostrarStatus('❌ Erro ao ler o arquivo', 'erro');
        };
        reader.readAsArrayBuffer(dadosFonte);
        
    } catch (error) {
        console.error('Erro ao exportar:', error);
        mostrarStatus('❌ Erro ao exportar: ' + error.message, 'erro');
    }
}

// ============================================
// RESETAR
// ============================================
function resetarTudo() {
    fonteCarregada = null;
    nomeFonte = '';
    dadosFonte = null;
    glifosModificados = {};
    fonteInfo.style.display = 'none';
    btnExportar.disabled = true;
    preview.innerHTML = '<span style="color:#b2bec3;">Carregue uma fonte para começar</span>';
    statusDiv.style.display = 'none';
    fileInput.value = '';
    console.log('🔄 Resetado!');
}

// ============================================
// STATUS
// ============================================
function mostrarStatus(msg, tipo) {
    console.log('📢 Status:', tipo, '-', msg);
    statusDiv.textContent = msg;
    statusDiv.className = 'status ' + tipo;
    statusDiv.style.display = 'block';
    
    if (tipo === 'sucesso' || tipo === 'info') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
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
        
        // Atualiza preview se tiver fonte
        if (fonteCarregada) {
            gerarGlifosModificados();
            atualizarPreview();
        }
    });
});

// Enter para atualizar preview
textoPreview.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
        atualizarPreview();
    }
});

// ============================================
// TESTE INICIAL
// ============================================
console.log('✅ Script carregado!');
console.log('📌 Clique em "Escolher Arquivo" para carregar uma fonte.');
console.log('🔍 opentype disponível:', typeof opentype !== 'undefined');

// Verifica se opentype está disponível
if (typeof opentype !== 'undefined') {
    console.log('✅ opentype.js está disponível');
    // Tenta usar a função de parse
    console.log('📖 opentype.parse é uma função?', typeof opentype.parse === 'function');
} else {
    console.error('❌ opentype.js NÃO está disponível!');
}
