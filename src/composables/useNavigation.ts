import { ref } from 'vue'

const activeTitle = ref('Dashboard')
const activeSubtitle = ref('Overview of your vineyard status')

export function useNavigation() {
    const setNavigation = (title: string, subtitle: string = '') => {
        activeTitle.value = title
        activeSubtitle.value = subtitle
    }

    return {
        activeTitle,
        activeSubtitle,
        setNavigation
    }
}
