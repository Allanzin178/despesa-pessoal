
class Despesa {
    constructor(ano, mes, dia, tipo, descricao, valor){
        this.ano = ano
        this.mes = mes
        this.dia = dia
        this.tipo = tipo
        this.descricao = descricao
        this.valor = valor
    }

    validarDados(){
        for(let i in this){
            if(this[i] == undefined || this[i] == '' || this[i] == null){
                modalPersonalizado(
                    'danger', 
                    'Erro na inclusão do registro', 
                    'Erro na gravação, verifique se todos os campos foram preenchidos corretamente!',
                    'danger',
                    'Volte e tente novamente',
                    '',
                    () => {
                        $('#modalPopup').modal('hide');
                    }
                )
                return false
            }
        }
        modalPersonalizado(
            'success', 
            'Registro inserido com sucesso', 
            'Despesa foi cadastrada com sucesso!',
            'success', 
            'Voltar',
            '',
                () => {
                    $('#modalPopup').modal('hide');
                }
        )
        return true
    }
}

class Bd {
    constructor(){
        this.id = localStorage.getItem('id')
        if(!this.id){
            localStorage.setItem('id', 0)
        }
    }

    getProximoId(){
        this.id++
        localStorage.setItem('id', this.id)
    }

    gravar(d){
        if(!d.validarDados()) return
        document.getElementById('ano').value = ''
        document.getElementById('mes').value = ''
        document.getElementById('dia').value = ''
        document.getElementById('tipo').value = ''
        document.getElementById('descricao').value = ''
        document.getElementById('valor').value = ''


        this.getProximoId()
        localStorage.setItem(this.id, JSON.stringify(d))
    }   

    editarDespesa(id, novaDespesa){
        if(!novaDespesa.validarDados()) return false
        localStorage.setItem(id, JSON.stringify(novaDespesa))
    }

    recuperarTodosRegistros(){
        let despesas = []
        for(let i = 1; i <= this.id; i++){
            let despesa = JSON.parse(localStorage.getItem(i))

            if(!despesa) continue        
            despesa.id = i   
            despesas.push(despesa)
        }
        return despesas
    }

    pesquisarDespesa(despesa){
        let despesas = []
        despesas = this.recuperarTodosRegistros()
        //ano
        if(despesa.ano != '') {
            despesas = despesas.filter(d => despesa.ano == d.ano)
        }

        //mes
        if(despesa.mes != '') {
            despesas = despesas.filter(d => despesa.mes == d.mes)
        }

        //dia
        if(despesa.dia != ''){
            despesas = despesas.filter(d => {
                // console.log(despesa.dia, d.dia) // para debug
                return despesa.dia == d.dia}
            )
        } 

        //tipo
        if(despesa.tipo != ''){
            despesas = despesas.filter(d => despesa.tipo == d.tipo)
        }

        //descricao
        if(despesa.descricao != '') {
            despesas = despesas.filter(d => despesa.descricao.toLowerCase() == d.descricao.toLowerCase())
        }

        //valor
        if(despesa.valor != '') {
            despesas = despesas.filter(d => despesa.valor == d.valor)
        }
        return despesas
    }

    remover(id){
        localStorage.removeItem(id)
    }
}

class FormDespesas{
    constructor(){
        this.ano = document.getElementById('ano')
        this.mes = document.getElementById('mes')
        this.dia = document.getElementById('dia')
        this.tipo = document.getElementById('tipo')
        this.descricao = document.getElementById('descricao')
        this.valor = document.getElementById('valor')
    }

    getDespesa(){
        let despesa = new Despesa(
            this.ano.value,
            this.mes.value,
            this.dia.value,
            this.tipo.value,
            this.descricao.value,
            this.valor.value
        )
        return despesa
    }
}

let bd = new Bd()

function cadastrarDespesa() {
    let fd = new FormDespesas()
    bd.gravar(fd.getDespesa())
}

function carregaListaDespesas(despesas = Array(), filtro = false){
    if(despesas.length == 0 && filtro == false){
        despesas = bd.recuperarTodosRegistros()
    }
    let listaDespesas = document.getElementById('listaDespesas')
    listaDespesas.innerHTML = ''

    despesas.forEach(despesa => {
        let row = listaDespesas.insertRow()

        row.insertCell(0).textContent = `${despesa.dia}/${despesa.mes}/${despesa.ano}`

        switch(despesa.tipo){
            case '1': despesa.tipo = 'Alimentação'
                break 
            case '2': despesa.tipo = 'Educação'
                break 
            case '3': despesa.tipo = 'Lazer'
                break 
            case '4': despesa.tipo = 'Saúde'
                break 
            case '5': despesa.tipo = 'Transporte'
                break 
        }

        row.insertCell(1).textContent = despesa.descricao
        row.insertCell(2).textContent = despesa.tipo
        row.insertCell(3).textContent = `R$ ${despesa.valor}`

        // Botão de remover
        let btnRmv = document.createElement('button')
        btnRmv.className = 'btn btn-danger'
        btnRmv.innerHTML = '<i class="fas fa-times"></i>'
        btnRmv.id = `id_rmv_despesa_${despesa.id}`
        // Evento de clique
        btnRmv.onclick = function(){
            let id = this.id.replace('id_rmv_despesa_', "")
            bd.remover(id)
            carregaListaDespesas()
            modalPersonalizado(
                'success', 
                'Registro removido com sucesso', 
                `A despesa ${despesa.descricao} foi removida com sucesso`,
                'danger',
                'Fechar',
                '',
                () => {
                    $('#modalPopup').modal('hide');
                }
            )
        }
        btnRmv.style = 'min-height: 30px; min-width: 40px;'

        // Botão de editar
        let btnEdit = document.createElement('button')
        btnEdit.className = 'btn btn-success'
        btnEdit.innerHTML = '<i class="fas fa-pen fa-sm"></i>'
        btnEdit.id = `id_edit_despesa_${despesa.id}`

        // Evento de clique
        btnEdit.onclick = function(){
            // Recupera o id da despesa
            let id = this.id.replace('id_edit_despesa_', "")

            // Cria um formulario igual o de busca
            let form = new CriaForm(despesa)

            // Cria o modal
            modalPersonalizado(
                'primary', // Estilo do titulo
                `Editando despesa de ${despesa.descricao} (${despesa.dia}/${despesa.mes}/${despesa.ano})`, // Conteudo do titulo
                `${form.getDivInicial().outerHTML}`, // Conteudo do body (aqui no caso é o formulario) (É passado como innerHtml)
                'success', // Estilo do botão
                'Salvar e fechar', // Conteudo do botão
                'modal-lg', // Tamanho (opcional)
                () => {
                    if (bd.editarDespesa(id, form.getFormDespesa()) !== false){
                        carregaListaDespesas()// Função do botão (opcional)
                    }
                } 
            )

            document.getElementById(`dia_${despesa.id}`).value = despesa.dia
            document.getElementById(`mes_${despesa.id}`).value = despesa.mes
            document.getElementById(`ano_${despesa.id}`).value = despesa.ano
            document.getElementById(`tipo_${despesa.id}`).value = formatarTipo(despesa.tipo)
            document.getElementById(`descricao_${despesa.id}`).value = despesa.descricao
            document.getElementById(`valor_${despesa.id}`).value = despesa.valor
        }
        btnEdit.style = 'margin-right: 10px; min-height: 30px; min-width: 40px;'
        let botoes = row.insertCell(4)
        botoes.append(btnEdit)
        botoes.append(btnRmv)
        
    })
}

function pesquisarDespesa(){
    let fd = new FormDespesas
    let despesa = fd.getDespesa()
    let despesasFiltradas = bd.pesquisarDespesa(despesa)
    carregaListaDespesas(despesasFiltradas, true)
}

function modalPersonalizado(styleModal = 'danger', titleModal, bodyModal, styleBtnModal, btnModal, modalAdds = '', btnFunction = undefined){
    let modalTitle = document.getElementById('modal-title')
    let modalTitleDiv = document.getElementById('modal-title-div')
    let modalBody = document.getElementById('modal-body')
    let modalButton = document.getElementById('modal-button')
    let modalInner = document.getElementById('modal-inner')

    modalInner.className = `modal-dialog ${modalAdds}`
    modalTitleDiv.className = `modal-header text-${styleModal}`
    modalTitle.textContent = titleModal
    modalBody.innerHTML = bodyModal
    modalButton.className = `btn btn-${styleBtnModal}`
    modalButton.textContent = btnModal
    modalButton.onclick = btnFunction
  

    $('#modalPopup').modal('show')
}

class CriaForm{
    constructor(d){
        this.idDia = `dia_${d.id}`
        this.idMes = `mes_${d.id}`
        this.idAno = `ano_${d.id}`
        this.idTipo = `tipo_${d.id}`
        this.idDescricao = `descricao_${d.id}`
        this.idValor = `valor_${d.id}`

        let divInicial = document.createElement('div')
        divInicial.className = 'px-3'
        
        this.divInicial = divInicial
        
        this.divInicial.appendChild(this.criarRow1())
        this.divInicial.appendChild(this.criarRow2())
    }

    criarRow1(){
        let meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
        let anos = ['2024', '2025']
        let tipos = ['Alimentação', 'Educação', 'Lazer', 'Saúde', 'Transporte']

        let row1 = document.createElement('div')
        let colDia = document.createElement('div')
        let colMes = document.createElement('div')
        let colAno = document.createElement('div')
        let colTipo = document.createElement('div')
        
        
        row1.className = 'row'
        colDia.className = 'col-md-3 form-group'
        colMes.className = 'col-md-3 form-group'
        colAno.className = 'col-md-3 form-group'
        colTipo.className = 'col-md-3 form-group'
        
        colDia.appendChild(this.criarLabel(this.idDia, 'Dia'))
        colDia.appendChild(this.criarInput(this.idDia, 'text', 'Dia'))

        colMes.appendChild(this.criarLabel(this.idMes, 'Mês'))
        colMes.appendChild(this.criarSelect(this.idMes, meses))

        colAno.appendChild(this.criarLabel(this.idAno, 'Ano'))
        colAno.appendChild(this.criarSelect(this.idAno, anos, false))

        colTipo.appendChild(this.criarLabel(this.idTipo, 'Tipo'))
        colTipo.appendChild(this.criarSelect(this.idTipo, tipos))
    
        row1.appendChild(colDia)
        row1.appendChild(colMes)
        row1.appendChild(colAno)
        row1.appendChild(colTipo)
        

        return row1
    }

    criarRow2(){
        let row2 = document.createElement('div')
        let colDescricao = document.createElement('div')
        let colValor = document.createElement('div')

        row2.className = 'row'
        colDescricao.className = 'col-md-9 form-group'
        colValor.className = 'col-md-3 form-group'

        colDescricao.appendChild(this.criarLabel(this.idDescricao, 'Descrição'))
        colDescricao.appendChild(this.criarInput(this.idDescricao, 'text', 'Descrição'))

        colValor.appendChild(this.criarLabel(this.idValor, 'Valor'))
        colValor.appendChild(this.criarInput(this.idValor, 'text', 'Valor'))

        row2.appendChild(colDescricao)
        row2.appendChild(colValor)

        return row2
    }

    criarSelect(id, options, valueIncremental = true){
        let select = document.createElement('select')
        select.className = 'form-control'
        select.id = id
        options.forEach((o, index) => {
            let option = document.createElement('option')
            option.value = valueIncremental == true ? index + 1 : o
            option.innerHTML = `${o}`
            select.appendChild(option)
        })
        return select
    }

    criarLabel(id, content){
        let label = document.createElement('label')
        label.setAttribute('for', id)
        label.innerHTML = content
        return label
    }

    criarInput(id, type, placeholder){
        let input = document.createElement('input')
        input.setAttribute('placeholder', placeholder)
        input.className = 'form-control'
        input.type = type
        input.id = id
        return input
    }
    
    getDivInicial(){
        return this.divInicial
    }

    getFormDespesa(){
        let despesa = new Despesa(
            document.getElementById(this.idAno).value,
            document.getElementById(this.idMes).value,
            document.getElementById(this.idDia).value,
            document.getElementById(this.idTipo).value,
            document.getElementById(this.idDescricao).value,
            document.getElementById(this.idValor).value
        )
        return despesa
    }
}

function formatarTipo(sTipo){
    let nTipo
    switch(sTipo){
        case 'Alimentação':
            nTipo = '1'
            break;
        case 'Educação':
            nTipo = '2'
            break;
        case 'Lazer':
            nTipo = '3'
            break;
        case 'Saúde':
            nTipo = '4'
            break;
        case 'Transporte':
            nTipo = '5'
            break;
        default:
            break;
    }
    // console.log('numero ' + nTipo)
    // console.log(sTipo)
    return nTipo
}

// SÓ 420 LINHAS CARALHO TA OTIMIZADO DEMAIS ISSO SELOCO