import Image from "next/image"

export const Logo = () => {
  return (
    <div>
        <Image src={'/logo.png'} alt="Allure Logo" width={120} height={20} />
    </div>
  )
}