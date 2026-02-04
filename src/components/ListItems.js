import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

export const ListItems = () => {
    const category = useCurrentSidebarCategory();
    return (
        <ul>
            {category.items.map((item, index) => (
                <li key={index}>
                    <a href={item.href}>{item.label}</a>
                </li>
            ))}
        </ul>
    );
};
