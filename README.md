# Gerador de Senhas Vétus

Versão estática do gerador, criada com HTML, CSS e JavaScript para abrir no navegador e publicar no GitHub Pages.

## Arquivos

- `index.html` — interface do gerador.
- `style.css` — cores e layout responsivo da Vétus.
- `script.js` — geração, cópia e estimativa aproximada da senha.
- `logo-vetus.webp` — logo da Vétus.

## Funcionalidades

- Tamanho configurável de 12 a 64 caracteres.
- Letras minúsculas e maiúsculas, números e símbolos selecionáveis.
- Opção para permitir espaços e evitar caracteres repetidos.
- A senha inclui ao menos um caractere de cada grupo selecionado.
- Botões para mostrar, copiar e gerar outra senha.
- Estimativa aproximada com base no conjunto e no comprimento escolhidos.

## Privacidade

A geração usa `crypto.getRandomValues()` no navegador. A página não envia nem salva a senha por conta própria; ela só vai para a área de transferência quando a pessoa escolhe **Copiar senha**. A estimativa de força é aproximada e não consulta listas de senhas vazadas.

Use uma senha diferente para cada serviço e guarde-a em um gerenciador de senhas. A senha não deve ser enviada em links ou mensagens de compartilhamento.

## GitHub Pages

Publique esta pasta como a raiz de um repositório próprio ou use um workflow do GitHub Pages para publicar os arquivos estáticos dela. O `index.html` é o ponto de entrada. Não é necessário instalar dependências para a versão HTML/CSS/JavaScript.

O GitHub Pages não executa `app.py`. O arquivo Python e `requirements.txt` permanecem como a versão Streamlit separada. Uma página estática não cria login ou acesso restrito a assinantes; qualquer pessoa com acesso ao endereço poderá usar o gerador.
