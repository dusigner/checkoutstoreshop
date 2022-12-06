export default class RemoveItensModal {
    init() {
        if($('#closeRemoveItensModal').length) return 

        const element = `
            <div id="closeRemoveItensModal" class="absolute top-0 right-0 pa4-ns pointer">
                <svg class="vtex__icon-close  " width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none">
                    <g fill="currentColor">
                        <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z">
                        </path>
                    </g>
                </svg>
            </div>
        `

        const _modalHeader = $('.modal-header b')
        _modalHeader.after(element)
        
        $('#closeRemoveItensModal').click(function(){ 
            $('.vtex-shipping-preview-0-x-modalCancelButton').click()
        })
    }

}