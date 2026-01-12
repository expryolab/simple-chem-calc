"use client";
import { FaCalculator } from "react-icons/fa";
import { MdOutlineScale } from "react-icons/md";
import { MdScale } from "react-icons/md";
import { RiScales2Fill } from "react-icons/ri";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import Link from "next/link";

export const NaviBar = () => {
  return (
    <NavigationMenu.Root className="">
      <NavigationMenu.List className="">
        <NavigationMenu.Item className="">
          <NavigationMenu.Link asChild className="">
            <Link href="/" className="NavigationMenuRoot">
              <FaCalculator className="inline-block mr-2 mb-1 " />
              ホーム
            </Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Link asChild className="">
            <Link href="/proportion" className="NavigationMenuRoot">
              <MdOutlineScale className="inline-block mr-2 mb-1" />
              実量 → %
            </Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link asChild className="">
            <Link href="/prorate" className="NavigationMenuRoot">
              <MdScale className="inline-block mr-2 mb-1" />% → 実量
            </Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link asChild className="">
            <Link href="/serving-scale" className="NavigationMenuSubRoot">
              <RiScales2Fill className="inline-block mr-2 mb-1" />
              料理を作る時の分量調整
            </Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
};
